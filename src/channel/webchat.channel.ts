import Prisma from '@prisma/client';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import merge from 'deepmerge';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { Message } from 'src/message/entities/message.entity';
import { ButtonType } from 'src/message/enums/button-type.enum';
import { v4 } from 'uuid';
import { AbstractChannel } from './abstract.channel';
import { WebchatEvent } from './interfaces/webchat-event.interface';

export class WebchatChannel extends AbstractChannel<WebchatEvent> {
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
  ): Promise<Message[]> {
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
          Message,
          await this.createMessage(
            chat,
            message.message_id,
            {
              create: {
                text: message.text,
                attachments: {
                  create: message.attachment && {
                    type: Prisma.AttachmentType.Image,
                    url: message.attachment.payload.src,
                  },
                },
                buttons: message.quick_replies?.map((button: any) => ({
                  type: ButtonType.QuickReply,
                  text: button.title,
                })),
              },
            },
            Prisma.MessageStatus.Delivered,
            true,
          ),
        ),
      ),
    );
  }

  async handle(channel: Prisma.Channel, event: WebchatEvent): Promise<'ok'> {
    const chat = await this.createChat(
      channel.projectId,
      channel.id,
      event.session_id,
    );

    const message = await this.createMessage(
      chat,
      v4(),
      {
        create: {
          text: event.message,
        },
      },
      Prisma.MessageStatus.Delivered,
    );

    this.client.emit('receiveChat', {
      projectId: channel.projectId,
      chat: merge(
        chat,
        {
          contact: {
            name: 'N/A',
          },
          messages: [message],
        },
        {
          arrayMerge: (_, source) => source,
        },
      ),
    });

    this.client.emit('receiveMessage', {
      projectId: channel.projectId,
      message,
    });

    return 'ok';
  }
}
