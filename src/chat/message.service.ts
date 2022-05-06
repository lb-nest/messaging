import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookEventType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ApiChannelRepository } from 'src/shared/api-channel.repository';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageWithChatId } from './entities/message-with-chat-id.entity';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly webhookSenderService: WebhookSenderService,
    private readonly apiChannelRepository: ApiChannelRepository,
  ) {}

  async create(
    projectId: number,
    chatId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<MessageWithChatId[]> {
    const chat = await this.prismaService.chat.findFirst({
      where: {
        id: chatId,
        channel: {
          projectId,
        },
      },
      include: {
        contact: true,
        channel: true,
      },
    });

    const messages = await this.apiChannelRepository
      .get(chat.channel.type)
      .send(chat.channel, chat, createMessageDto);

    await this.webhookSenderService.dispatchAsync(projectId, {
      type: WebhookEventType.OutgoingChats,
      payload: {
        id: chat.id,
        contact: chat.contact,
        isNew: chat.isNew,
        messages: [messages.at(-1)],
      },
    });

    await this.webhookSenderService.dispatchAsync(projectId, {
      type: WebhookEventType.OutgoingMessages,
      payload: messages,
    });

    return messages;
  }

  async findAll(
    projectId: number,
    chatId: number,
  ): Promise<MessageWithChatId[]> {
    return this.prismaService.message.findMany({
      where: {
        chat: {
          id: chatId,
          channel: {
            projectId,
          },
        },
      },
      orderBy: {
        id: 'desc',
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
    });
  }

  async update(
    projectId: number,
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageWithChatId> {
    throw new NotImplementedException();
  }

  async delete(projectId: number, id: number): Promise<MessageWithChatId> {
    throw new NotImplementedException();
  }
}
