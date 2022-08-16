import Prisma from '@prisma/client';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { WebchatEventDto } from 'src/channel/dto/webchat-event.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { MessageWithChatId } from 'src/chat/entities/message-with-chat-id.entity';
import { ButtonType } from 'src/chat/enums/button-type.enum';
import { v4 } from 'uuid';
import { AbstractChannel } from './abstract.channel';

export class WebchatChannel extends AbstractChannel<WebchatEventDto> {
  create(
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

  async handle(channel: Prisma.Channel, event: WebchatEventDto): Promise<'ok'> {
    const chat = await this.createChat(channel.id, event.session_id, {
      create: {
        name: 'N/A',
      },
    });

    const message = await this.createMessage(
      chat.id,
      Prisma.MessageStatus.Delivered,
      {
        create: {
          text: event.message,
          attachments: undefined,
          buttons: undefined,
        },
      },
      v4(),
    );

    this.client.emit('backend.chatsReceived', {
      projectId: channel.projectId,
      payload: [
        {
          ...chat,
          messages: [message],
        },
      ],
    });

    this.client.emit('backend.messagesReceived', {
      project: channel.projectId,
      payload: [message],
    });

    return 'ok';
  }
}
