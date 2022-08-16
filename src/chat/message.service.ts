import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MessageStatus } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { ChannelRepository } from 'src/channel/channel.repository';
import { PrismaService } from 'src/prisma.service';
import { BACKEND } from 'src/shared/constants/broker';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReadMessagesDto } from './dto/read-messages.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Chat } from './entities/chat.entity';
import { MessageWithChatId } from './entities/message-with-chat-id.entity';

@Injectable()
export class MessageService {
  constructor(
    @Inject(BACKEND) private readonly client: ClientProxy,
    private readonly channelRepository: ChannelRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async create(
    projectId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<MessageWithChatId[]> {
    const { channel, ...chat } = await this.prismaService.chat.findFirstOrThrow(
      {
        where: {
          id: createMessageDto.chatId,
          channel: {
            projectId,
          },
        },
        include: {
          contact: true,
          channel: true,
        },
      },
    );

    await this.prismaService.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    const messages = await this.channelRepository
      .get(channel.type)
      .send(channel, chat, createMessageDto);

    this.client.emit('chats.received', {
      projectId: channel.projectId,
      payload: {
        ...chat,
        messages: messages.slice(-1),
      },
    });

    for (const message of messages) {
      this.client.emit('messages.received', {
        projectId: channel.projectId,
        payload: message,
      });
    }

    return messages;
  }

  findAll(projectId: number, chatId: number): Promise<MessageWithChatId[]> {
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

  update(
    projectId: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageWithChatId> {
    throw new NotImplementedException();
  }

  remove(projectId: number, chatId: number): Promise<MessageWithChatId> {
    throw new NotImplementedException();
  }

  async markAsRead(
    projectId: number,
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
      this.client.emit('chats.received', {
        projectId,
        payload: [
          plainToClass(
            Chat,
            await this.prismaService.chat.update({
              where: {
                id: readMessagesDto.chatId,
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
        ],
      });
    }
  }
}
