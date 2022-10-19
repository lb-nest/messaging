import { GupshupClientApi, GupshupPartnerApi } from '@lb-nest/gupshup-api';
import Prisma from '@prisma/client';
import axios from 'axios';
import merge from 'deepmerge';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { MessageWithChatId } from 'src/chat/entities/message-with-chat-id.entity';
import { ButtonType } from 'src/chat/enums/button-type.enum';
import { AbstractChannel } from './abstract.channel';

export class WhatsappChannel extends AbstractChannel {
  private readonly HANDLERS: Record<
    string,
    (channel: Prisma.Channel, event: any) => Promise<void>
  > = {
    'user-event': this.handleUserEvent.bind(this),
    'message-event': this.handleMessageEvent.bind(this),
    'template-event': this.handleTemplateEvent.bind(this),
    'account-event': this.handleAccountEvent.bind(this),
    message: this.handleMessage.bind(this),
    'billing-event': this.handleBillingEvent.bind(this),
  };

  async create(
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const api = new GupshupPartnerApi(
      this.configService.get<string>('GS_USER'),
      this.configService.get<string>('GS_PASS'),
    );

    const app = await api.appLink(
      createChannelDto.accountId,
      createChannelDto.token,
    );

    const token = await api.getAccessToken(app.id);

    const channel = await this.prismaService.channel.create({
      data: {
        projectId,
        name: createChannelDto.name,
        type: Prisma.ChannelType.Whatsapp,
        accountId: app.id,
        token: `${app.phone}:${token}`,
        status: Prisma.ChannelStatus.Connected,
      },
    });

    await api.toggleAutomatedOptinMessage(token, app.id, false);
    await api.toggleTemplateMessaging(token, app.id, true);
    await api.updateDlrEvents(
      token,
      app.id,
      'ACCOUNT',
      'DELETED',
      'DELIVERED',
      'OTHERS',
      'READ',
      'SENT',
      'TEMPLATE',
    );

    const url = this.configService.get<string>('MESSAGING_URL');
    await api.setCallbackUrl(
      app.id,
      token,
      url.concat(`/channels/${channel.id}/webhook`),
    );

    return channel;
  }

  async send(
    channel: Prisma.Channel,
    chat: Prisma.Chat,
    message: CreateMessageDto,
  ): Promise<MessageWithChatId[]> {
    const [phone, token] = channel.token.split(':');
    const api = new GupshupClientApi(phone, token);

    const messages: Prisma.Prisma.MessageUncheckedCreateInput[] = [];

    if (message.attachments.length > 0) {
      await Promise.all(
        message.attachments.map(async (attachment, i) => {
          const msg: any = {
            [Prisma.AttachmentType.Audio]: {
              type: 'audio',
              url: attachment.url,
            },
            [Prisma.AttachmentType.Document]: {
              type: 'file',
              url: attachment.url,
            },
            [Prisma.AttachmentType.Image]: {
              type: 'image',
              previewUrl: attachment.url,
              originalUrl: attachment.url,
            },
            [Prisma.AttachmentType.Video]: {
              type: 'video',
              url: attachment.url,
            },
          }[attachment.type];

          if (message.text && i === 0) {
            msg.caption = message.buttons.reduce<string>((str, btn) => {
              switch (btn.type) {
                case ButtonType.Phone:
                case ButtonType.Url:
                  return str.concat(` | [${btn.text},${btn.phone || btn.url}]`);

                default:
                  return str.concat(` | [${btn.text}]`);
              }
            }, message.text);
          }

          messages.push({
            chatId: chat.id,
            externalId: await api.sendMessage(chat.accountId, msg),
            fromMe: true,
            status: Prisma.MessageStatus.Submitted,
            content: {
              create: {
                text: i === 0 ? message.text : undefined,
                attachments: {
                  create: attachment,
                },
                buttons: i === 0 ? (message.buttons as any) : undefined,
              },
            },
          });
        }),
      );
    } else {
      const msg: any = {
        type: 'text',
        text: message.buttons.reduce<string>((str, btn) => {
          switch (btn.type) {
            case ButtonType.Phone:
            case ButtonType.Url:
              return str.concat(` | [${btn.text},${btn.phone || btn.url}]`);

            default:
              return str.concat(` | [${btn.text}]`);
          }
        }, message.text ?? ''),
      };

      messages.push({
        chatId: chat.id,
        externalId: await api.sendMessage(chat.accountId, msg),
        fromMe: true,
        status: Prisma.MessageStatus.Submitted,
        content: {
          create: {
            text: message.text,
            buttons: message.buttons as any,
          },
        },
      });
    }

    return Promise.all(
      messages.map(async ({ content, externalId }) =>
        super.createMessage(
          chat.id,
          Prisma.MessageStatus.Submitted,
          content,
          externalId,
        ),
      ),
    );
  }

  async handle(channel: Prisma.Channel, event: any): Promise<void> {
    return this.HANDLERS[event.type]?.(channel, event);
  }

  private async handleUserEvent(
    channel: Prisma.Channel,
    event: any,
  ): Promise<void> {
    // TODO: handleUserEvent
  }

  private async handleMessageEvent(
    channel: Prisma.Channel,
    event: any,
  ): Promise<void> {
    const message = await this.prismaService.message.findFirst({
      where: {
        externalId: event.payload.id,
      },
    });

    if (!message) {
      return;
    }

    if (event.payload.type === 'enqueued') {
      await this.prismaService.message.update({
        where: {
          id: message.id,
        },
        data: {
          externalId: event.payload.payload.whatsappMessageId,
        },
      });

      return;
    }

    const status = {
      delivered: Prisma.MessageStatus.Delivered,
      failed: Prisma.MessageStatus.Failed,
    }[event.payload.type];

    if (status) {
      await this.prismaService.message.update({
        where: {
          id: message.id,
        },
        data: {
          status,
        },
      });
    }

    // TODO: notify message status changed
  }

  private async handleTemplateEvent(
    channel: Prisma.Channel,
    event: any,
  ): Promise<void> {
    const templateMessage = await this.prismaService.hsm.findUniqueOrThrow({
      where: {
        projectId_code: {
          projectId: channel.projectId,
          code: event.payload.elementName,
        },
      },
    });

    const status = {
      REJECTED: Prisma.ApprovalStatus.Rejected,
      APPROVED: Prisma.ApprovalStatus.Approved,
      DELETED: undefined,
      DISABLED: undefined,
    }[event.payload.status];

    if (status) {
      await this.prismaService.approval.update({
        where: {
          channelId_hsmId: {
            channelId: channel.id,
            hsmId: templateMessage.id,
          },
        },
        data: {
          status,
          rejectedReason: event.payload.rejectedReason,
        },
      });
    }
  }

  private async handleAccountEvent(
    channel: Prisma.Channel,
    event: any,
  ): Promise<void> {
    // TODO: handleAccountEvent
  }

  private async handleMessage(
    channel: Prisma.Channel,
    event: any,
  ): Promise<void> {
    const chat = await this.createChat(channel.id, event.payload.source, {
      create: {
        name: event.payload.sender.name,
      },
    });

    const message = await this.createMessage(
      chat.id,
      Prisma.MessageStatus.Submitted,
      {
        create: await this.createContent(event),
      },
      event.payload.id,
    );

    this.client.emit('chats.received', {
      projectId: channel.projectId,
      payload: merge.all([
        {
          ...chat,
          messages: [message],
        },
        {
          contact: {
            telegramId: chat.accountId,
          },
        },
      ]),
    });

    this.client.emit('messages.received', {
      projectId: channel.projectId,
      payload: message,
    });
  }

  private async handleBillingEvent(
    channel: Prisma.Channel,
    event: any,
  ): Promise<void> {
    // TODO: handleBillingEvent
  }

  private async createContent(
    event: any,
  ): Promise<Omit<Prisma.Prisma.ContentCreateInput, 'message'>> {
    if (event.payload.type) {
      return {
        text: event.payload.payload.text,
      };
    }

    const res = await axios.get(event.payload.payload.url, {
      responseType: 'stream',
    });

    const url = await this.s3Service.upload(res.data);
    return {
      audio: {
        attachments: {
          create: {
            type: Prisma.AttachmentType.Audio,
            url,
          },
        },
      },
      file: {
        attachments: {
          create: {
            type: Prisma.AttachmentType.Document,
            url,
          },
        },
      },
      image: {
        text: event.payload.payload.caption,
        attachments: {
          create: {
            type: Prisma.AttachmentType.Image,
            url,
          },
        },
      },
      video: {
        text: event.payload.payload.caption,
        attachments: {
          create: {
            type: Prisma.AttachmentType.Video,
            url,
          },
        },
      },
    }[event.payload.type];
  }
}
