import { Injectable, NotImplementedException } from '@nestjs/common';
import { WebhookEventType } from '@prisma/client';
import { ApiChannelFactory } from 'src/chat/api-channel/api-channel.factory';
import { PrismaService } from 'src/prisma.service';
import { WebhookDispatcher } from 'src/shared/webhook-dispatcher.service';
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

    const messages = await this.apiChannelFactory
      .create(chat.channel)
      .sendMessage<any>(chat, createMessageDto);

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
