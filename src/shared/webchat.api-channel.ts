import * as Prisma from '@prisma/client';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { WebchatEventDto } from 'src/channel/dto/webchat-event.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { Chat } from 'src/chat/entities/chat.entity';
import { MessageWithChatId } from 'src/chat/entities/message-with-chat-id.entity';
import { ButtonType } from 'src/hsm/enums/button-type.enum';
import * as uuid from 'uuid';
import { ApiChannel } from './api-channel.interface';
import { WebhookSenderService } from './webhook-sender.service';

export class WebchatApiChannel extends ApiChannel<WebchatEventDto> {
  async create(
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    return this.prismaService.channel.create({
      data: {
        projectId,
        ...createChannelDto,
        status: Prisma.ChannelStatus.Connected,
      },
    });
  }

  async send(
    channel: Prisma.Channel,
    chat: Prisma.Chat,
    message: CreateMessageDto,
  ): Promise<MessageWithChatId[]> {
    const url = this.configService.get<string>('WEBSOCKET_EDGE_URL');
    const messages: any[] = [];

    if (message.text) {
      const res = await axios.post<any>(
        url.concat(`/sessions/${chat.accountId}/messages`),
        {
          text: message.text,
          quick_replies: message.buttons
            ?.filter(({ type }) => type === ButtonType.QuickReply)
            .map(({ text }) => ({
              content_type: 'text',
              title: text,
              payload: text,
            })),
        },
      );

      messages.push(res.data);
    }

    if (message.attachments) {
      const res = await Promise.all(
        message.attachments
          .filter(({ type }) => type === Prisma.AttachmentType.Image)
          .map((attachment) =>
            axios.post<any>(
              url.concat(`/sessions/${chat.accountId}/messages`),
              {
                attachment: {
                  type: 'image',
                  payload: {
                    src: attachment.url,
                  },
                },
              },
            ),
          ),
      );

      messages.push(...res.map(({ data }) => data));
    }

    return Promise.all(
      messages.map(async (message) =>
        plainToClass(
          MessageWithChatId,
          await this.prismaService.message.create({
            data: {
              chatId: chat.id,
              externalId: message.message_id,
              fromMe: true,
              status: Prisma.MessageStatus.Delivered,
              content: {
                create: {
                  text: message.text,
                  attachments: {
                    create: message.attachment && {
                      type: Prisma.AttachmentType.Image,
                      url: message.attachment.payload.src,
                    },
                  },
                  buttons: message.quick_replies?.map((button: any) => ({
                    ...button,
                    type: ButtonType.QuickReply,
                  })),
                },
              },
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
        ),
      ),
    );
  }

  async handle(
    channel: Prisma.Channel,
    event: WebchatEventDto,
    webhookSenderService: WebhookSenderService,
  ): Promise<'ok'> {
    const chat = plainToClass(
      Chat,
      await this.prismaService.chat.upsert({
        where: {
          channelId_accountId: {
            channelId: channel.id,
            accountId: event.session_id,
          },
        },
        create: {
          accountId: event.session_id,
          contact: {
            create: {
              name: 'N/A',
              username: event.session_id,
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
            create: {
              text: event.message,
              attachments: undefined,
              buttons: undefined,
            },
          },
          externalId: uuid.v4(),
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

    return 'ok';
  }
}
