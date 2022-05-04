import { ConfigService } from '@nestjs/config';
import * as Prisma from '@prisma/client';
import axios from 'axios';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { WebchatEventDto } from 'src/channel/dto/webchat-event.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { ButtonType } from 'src/hsm/enums/button-type.enum';
import { PrismaService } from 'src/prisma.service';
import * as uuid from 'uuid';
import { ApiChannel } from './api-channel.interface';
import { WebhookSenderService } from './webhook-sender.service';

export class WebchatApiChannel extends ApiChannel {
  static async create(
    projectId: number,
    data: CreateChannelDto,
    prisma: PrismaService,
    config: ConfigService,
  ): Promise<Channel> {
    return prisma.channel.create({
      data: {
        projectId,
        ...data,
        status: Prisma.ChannelStatus.Connected,
      },
    });
  }

  static async handleEvent(
    channel: Prisma.Channel,
    event: WebchatEventDto,
    prisma: PrismaService,
    webhookSender: WebhookSenderService,
  ): Promise<'ok'> {
    const chat = await prisma.chat.upsert({
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
      select: {
        id: true,
        isNew: true,
        contact: {
          select: {
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const message = await prisma.message.create({
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
      select: {
        id: true,
        fromMe: true,
        status: true,
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
          select: {
            text: true,
            attachments: {
              select: {
                type: true,
                url: true,
                name: true,
              },
            },
            buttons: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    await webhookSender.dispatchAsync(channel.projectId, {
      type: Prisma.WebhookEventType.IncomingChats,
      payload: {
        ...chat,
        messages: [message],
      },
    });

    await webhookSender.dispatchAsync(channel.projectId, {
      type: Prisma.WebhookEventType.IncomingMessages,
      payload: [message],
    });

    return 'ok';
  }

  async send(chat: Prisma.Chat, message: CreateMessageDto): Promise<any[]> {
    const messages: any[] = [];

    if (message.attachments) {
      const url = this.configService.get<string>('WEBSOCKET_EDGE_URL');
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

    if (message.text) {
      const url = this.configService.get<string>('WEBSOCKET_EDGE_URL');
      const res = await axios.post<any>(
        url.concat(`/sessions/${chat.accountId}/messages`),
        {
          text: message.text,
          quick_replies: message.buttons
            ?.filter((button) => button.type === ButtonType.QuickReply)
            .map((button: any) => ({
              content_type: 'text',
              title: button.title,
              payload: button.payload,
            })),
        },
      );

      messages.push(res.data);
    }

    return Promise.all(
      messages.map((message) =>
        this.prismaService.message.create({
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
          select: {
            id: true,
            fromMe: true,
            status: true,
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
              select: {
                text: true,
                attachments: {
                  select: {
                    type: true,
                    url: true,
                    name: true,
                  },
                },
                buttons: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        }),
      ),
    );
  }
}
