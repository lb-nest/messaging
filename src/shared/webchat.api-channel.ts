import { ConfigService } from '@nestjs/config';
import {
  AttachmentType,
  Channel,
  ChannelStatus,
  Chat,
  MessageStatus,
  WebhookEventType,
} from '@prisma/client';
import axios from 'axios';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { WebchatEventDto } from 'src/channel/dto/webchat-event.dto';
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
  ): Promise<any> {
    const channel = await prisma.channel.create({
      data: {
        projectId,
        ...data,
        status: ChannelStatus.Connected,
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });

    return channel;
  }

  static async handleEvent(
    channel: Channel,
    event: WebchatEventDto,
    prisma: PrismaService,
    webhookSender: WebhookSenderService,
  ) {
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
        messages: true,
      },
    });

    if (chat.isNew) {
      await webhookSender.dispatch(channel.projectId, {
        type: WebhookEventType.IncomingChats,
        payload: chat,
      });
    }

    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        fromMe: false,
        status: MessageStatus.Delivered,
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

    await webhookSender.dispatch(channel.projectId, {
      type: WebhookEventType.IncomingMessages,
      payload: [message],
    });

    return 'ok';
  }

  async send(chat: Chat, message: CreateMessageDto): Promise<any[]> {
    const messages = [];

    if (message.attachments) {
      const url = this.configService.get<string>('WEBSOCKET_EDGE_URL');
      const res = await Promise.all(
        message.attachments
          .filter((attachment) => attachment.type === AttachmentType.Image)
          .map((attachment) =>
            axios.post(url.concat(`/sessions/${chat.accountId}/messages`), {
              attachment: {
                type: 'image',
                payload: {
                  src: attachment.url,
                },
              },
            }),
          ),
      );

      messages.push(...res.map(({ data }) => data));
    }

    if (message.text) {
      const url = this.configService.get<string>('WEBSOCKET_EDGE_URL');
      const res = await axios.post(
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
            status: MessageStatus.Delivered,
            content: {
              create: {
                text: message.text,
                attachments: {
                  create: message.attachment && {
                    type: AttachmentType.Image,
                    url: message.attachment.payload.src,
                  },
                },
                buttons: message.quick_replies?.map((button) => ({
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
