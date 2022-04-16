import { Injectable, NotImplementedException } from '@nestjs/common';
import { MessageStatus, WebhookEventType } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { ApiChannelFactory } from 'src/common/api-channel.factory';
import { TelegramApiChannel } from 'src/common/api-channel/telegram.api-channel';
import { WebhookDispatcher } from 'src/common/webhook-dispatcher.service';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly apiChannelFactory: ApiChannelFactory,
    private readonly webhookDispatcher: WebhookDispatcher,
  ) {}

  async create(
    projectId: number,
    chatId: number,
    createMessageDto: CreateMessageDto,
  ) {
    const chat = await this.prismaService.chat.findFirst({
      where: {
        id: chatId,
        channel: {
          projectId,
        },
      },
      include: {
        channel: true,
      },
    });

    const result = await this.apiChannelFactory
      .create(chat.channel)
      .sendMessage<any>(chat, createMessageDto);

    const bot = new TelegramBot(chat.channel.token);

    const messages = await Promise.all(
      result.map(async (message) =>
        this.prismaService.message.create({
          data: {
            chatId: chat.id,
            externalId: String(message.message_id),
            fromMe: true,
            status: MessageStatus.Delivered,
            content: {
              create: {
                buttons: undefined, // TODO: buttons
                text: message.text ?? message.caption,
                attachments: {
                  create: await TelegramApiChannel.createAttachment(
                    bot,
                    message,
                  ),
                },
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

    this.webhookDispatcher.dispatch(projectId, {
      type: WebhookEventType.OutgoingMessages,
      payload: messages,
    });

    return messages;
  }

  findAll(projectId: number, chatId: number) {
    return this.prismaService.message.findMany({
      where: {
        chat: {
          id: chatId,
          channel: {
            projectId,
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
    });
  }

  async update(
    projectId: number,
    id: number,
    updateMessageDto: UpdateMessageDto,
  ) {
    throw new NotImplementedException();
  }

  async delete(projectId: number, id: number) {
    throw new NotImplementedException();
  }
}
