import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import Prisma from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { Chat } from 'src/chat/entities/chat.entity';
import { MessageWithChatId } from 'src/chat/entities/message-with-chat-id.entity';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3.service';

export abstract class AbstractChannel<T = unknown> {
  constructor(
    protected readonly configService: ConfigService,
    protected readonly client: ClientProxy,
    protected readonly prismaService: PrismaService,
    protected readonly s3Service: S3Service,
  ) {}

  abstract create(
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel>;

  abstract send(
    channel: Prisma.Channel,
    chat: Prisma.Chat,
    message: CreateMessageDto,
  ): Promise<MessageWithChatId[]>;

  abstract handle(channel: Prisma.Channel, event: T): Promise<unknown>;

  protected async createChat(
    channelId: number,
    accountId: string,
    contact: Prisma.Prisma.ContactCreateNestedOneWithoutChatInput,
  ): Promise<Chat> {
    return plainToClass(
      Chat,
      await this.prismaService.chat.upsert({
        where: {
          channelId_accountId: {
            channelId,
            accountId,
          },
        },
        create: {
          accountId,
          unreadCount: 1,
          channel: {
            connect: {
              id: channelId,
            },
          },
          contact,
        },
        update: {
          isNew: false,
          unreadCount: {
            increment: 1,
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
    );
  }

  protected async createMessage(
    chatId: number,
    status: Prisma.MessageStatus,
    content: Prisma.Prisma.ContentCreateNestedManyWithoutMessageInput,
    externalId: string,
    fromMe = false,
  ): Promise<MessageWithChatId> {
    return plainToClass(
      MessageWithChatId,
      await this.prismaService.message.upsert({
        where: {
          chatId_externalId: {
            chatId,
            externalId,
          },
        },
        create: {
          chat: {
            connect: {
              id: chatId,
            },
          },
          fromMe,
          status,
          content,
          externalId,
        },
        update: {
          content,
          updatedAt: new Date(),
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
  }
}
