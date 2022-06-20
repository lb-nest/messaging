import { Injectable, NotImplementedException } from '@nestjs/common';
import { MessageStatus, WebhookEventType } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { PrismaService } from 'src/prisma.service';
import { ApiChannelRepository } from 'src/shared/api-channel.repository';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReadMessagesDto } from './dto/read-messages.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Chat } from './entities/chat.entity';
import { MessageWithChatId } from './entities/message-with-chat-id.entity';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly webhookSenderService: WebhookSenderService,
    private readonly apiChannelRepository: ApiChannelRepository,
  ) {}

  async create(
    projectId: number,
    chatId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<MessageWithChatId[]> {
    const { channel, ...chat } = await this.prismaService.chat.findFirst({
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

    await this.prismaService.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    const messages = await this.apiChannelRepository
      .get(channel.type)
      .send(channel, chat, createMessageDto);

    await this.webhookSenderService.dispatchAsync(projectId, {
      type: WebhookEventType.OutgoingChats,
      payload: {
        ...chat,
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

  async markAsRead(
    projectId: number,
    id: number,
    readMessagesDto: ReadMessagesDto,
  ): Promise<void> {
    const messages = await this.prismaService.message.updateMany({
      where: {
        chat: {
          channel: {
            projectId,
          },
        },
        id: {
          in: readMessagesDto.ids,
        },
        fromMe: false,
      },
      data: {
        status: MessageStatus.Read,
      },
    });

    if (messages.count > 0) {
      this.webhookSenderService.dispatch(projectId, {
        type: WebhookEventType.OutgoingChats,
        payload: plainToClass(
          Chat,
          await this.prismaService.chat.update({
            where: {
              id,
            },
            data: {
              unreadCount: {
                decrement: messages.count,
              },
            },
            include: {
              contact: true,
              messages: {
                orderBy: {
                  id: 'desc',
                },
                take: 1,
                include: {
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
              },
            },
          }),
        ),
      });
    }
  }
}
