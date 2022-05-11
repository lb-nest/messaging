import { BadRequestException } from '@nestjs/common';
import * as Prisma from '@prisma/client';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import qs from 'qs';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { Chat } from 'src/chat/entities/chat.entity';
import { MessageWithChatId } from 'src/chat/entities/message-with-chat-id.entity';
import { ButtonType } from 'src/hsm/enums/button-type.enum';
import { ApiChannel } from './api-channel.interface';
import { WebhookSenderService } from './webhook-sender.service';

export class WhatsappApiChannel extends ApiChannel {
  private readonly url = 'https://api.gupshup.io/sm/api/v1/msg';

  async create(
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    try {
      return await this.prismaService.channel.create({
        data: {
          projectId,
          ...createChannelDto,
          status: Prisma.ChannelStatus.Connected,
        },
      });
    } catch {
      throw new BadRequestException();
    }
  }

  async send(
    channel: Prisma.Channel,
    chat: Prisma.Chat,
    message: CreateMessageDto,
  ): Promise<MessageWithChatId[]> {
    const messages: Prisma.Prisma.MessageUncheckedCreateInput[] = [];

    if (message.buttons) {
      messages.push(await this.sendHsm(channel, chat, message));
    } else {
      if (message.text) {
        messages.push({
          chatId: chat.id,
          externalId: await this.api(
            chat.accountId,
            channel.token,
            channel.accountId,
            {
              type: 'text',
              text: message.text,
            },
          ),
          fromMe: true,
          status: Prisma.MessageStatus.Accepted,
          content: {
            create: {
              text: message.text,
            },
          },
        });
      }

      await Promise.all(
        message.attachments.map(async (attachment) => {
          const msg: any = {};
          switch (attachment.type) {
            case Prisma.AttachmentType.Audio:
              Object.assign(msg, {
                type: 'audio',
                url: attachment.url,
              });
              break;

            case Prisma.AttachmentType.Document:
              Object.assign(msg, {
                type: 'file',
                url: attachment.url,
              });
              break;

            case Prisma.AttachmentType.Image:
              Object.assign(msg, {
                type: 'image',
                previewUrl: attachment.url,
                originalUrl: attachment.url,
              });
              break;

            case Prisma.AttachmentType.Video:
              Object.assign(msg, {
                type: 'video',
                url: attachment.url,
              });
              break;
          }

          messages.push({
            chatId: chat.id,
            externalId: await this.api(
              chat.accountId,
              channel.token,
              channel.accountId,
              msg,
            ),
            fromMe: true,
            status: Prisma.MessageStatus.Accepted,
            content: {
              create: {
                attachments: {
                  create: attachment,
                },
              },
            },
          });
        }),
      );
    }

    return Promise.all(
      messages.map(async (message) =>
        plainToClass(
          MessageWithChatId,
          this.prismaService.message.create({
            data: message,
            include: {
              chat: {
                select: {
                  id: true,
                },
              },
              content: {
                orderBy: {
                  id: 'desc',
                },
                take: 1,
                include: {
                  attachments: true,
                },
              },
            },
          }),
        ),
      ),
    );
  }

  async handle(
    channel: Prisma.Channel,
    event: any,
    webhookSenderService: WebhookSenderService,
  ): Promise<void> {
    switch (event.type) {
      case 'message':
        await this.handleMessage(channel, event, webhookSenderService);
        break;
    }
  }

  private async sendHsm(
    channel: Prisma.Channel,
    chat: Prisma.Chat,
    message: CreateMessageDto,
  ): Promise<Prisma.Prisma.MessageUncheckedCreateInput> {
    const msg: any = {
      type: 'quick_reply',
    };

    if (message.text) {
      msg.content = {
        type: 'text',
        text: message.text,
      };
    }

    if (message.buttons) {
      msg.options = message.buttons
        .filter((button) => button.type === ButtonType.QuickReply)
        .map((button) => ({
          type: 'text',
          title: button.text,
        }));
    }

    return {
      chatId: chat.id,
      externalId: await this.api(
        chat.accountId,
        channel.token,
        channel.accountId,
        msg,
      ),
      fromMe: true,
      status: Prisma.MessageStatus.Accepted,
      content: {
        create: {
          text: message.text,
          buttons: message.buttons,
        },
      },
    };
  }

  private async handleMessage(
    channel: Prisma.Channel,
    event: any,
    webhookSenderService: WebhookSenderService,
  ) {
    const chat = plainToClass(
      Chat,
      await this.prismaService.chat.upsert({
        where: {
          channelId_accountId: {
            channelId: channel.id,
            accountId: event.payload.source,
          },
        },
        create: {
          accountId: event.payload.source,
          contact: {
            create: {
              name: event.payload.sender.name,
              username: event.payload.source,
            },
          },
          channel: {
            connect: {
              id: channel.id,
            },
          },
        },
        update: {
          isNew: false,
        },
        include: {
          contact: true,
        },
      }),
    );

    const message = plainToClass(
      MessageWithChatId,
      await this.prismaService.message.create({
        data: {
          chatId: chat.id,
          fromMe: false,
          status: Prisma.MessageStatus.Delivered,
          content: {
            create: await this.createContent(event),
          },
          externalId: event.payload.id,
        },
        include: {
          chat: {
            select: {
              id: true,
            },
          },
          content: {
            orderBy: {
              id: 'desc',
            },
            take: 1,
            include: {
              attachments: true,
            },
          },
        },
      }),
    );

    await webhookSenderService.dispatchAsync(channel.projectId, {
      type: Prisma.WebhookEventType.IncomingChats,
      payload: {
        ...chat,
        messages: [message],
      },
    });

    await webhookSenderService.dispatchAsync(channel.projectId, {
      type: Prisma.WebhookEventType.IncomingMessages,
      payload: [message],
    });
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

    switch (event.payload.type) {
      case 'audio':
        return {
          attachments: {
            create: {
              type: Prisma.AttachmentType.Audio,
              url,
            },
          },
        };

      case 'file':
        return {
          attachments: {
            create: {
              type: Prisma.AttachmentType.Document,
              url,
            },
          },
        };

      case 'image':
        return {
          text: event.payload.payload.caption,
          attachments: {
            create: {
              type: Prisma.AttachmentType.Image,
              url,
            },
          },
        };

      case 'video':
        return {
          text: event.payload.payload.caption,
          attachments: {
            create: {
              type: Prisma.AttachmentType.Video,
              url,
            },
          },
        };

      default:
        throw new BadRequestException();
    }
  }

  private async api(
    destination: string,
    source: string,
    sourceName: string,
    message: any,
  ): Promise<string> {
    const apikey = this.configService.get<string>('GS_SECRET');
    const res = await axios.post<any>(
      this.url,
      qs.stringify({
        channel: 'whatsapp',
        source,
        destination,
        message: JSON.stringify(message),
        'src.name': sourceName,
      }),
      {
        headers: {
          apikey,
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return res.data.messageId;
  }
}
