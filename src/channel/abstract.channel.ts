import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import Prisma from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { Message } from 'src/message/entities/message.entity';
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
  ): Promise<Message[]>;

  abstract handle(channel: Prisma.Channel, event: T): Promise<unknown>;

  protected async createChat(
    projectId: number,
    channelId: number,
    accountId: string,
  ): Promise<Chat> {
    return plainToClass(
      Chat,
      await this.prismaService.chat.upsert({
        where: {
          projectId_channelId_accountId: {
            projectId,
            channelId,
            accountId,
          },
        },
        create: {
          projectId,
          accountId,
          channel: {
            connect: {
              projectId_id: {
                projectId,
                id: channelId,
              },
            },
          },
          unreadCount: 1,
        },
        update: {
          isNew: false,
          unreadCount: {
            increment: 1,
          },
        },
        include: {
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
    chat: Prisma.Chat,
    externalId: string,
    content: Prisma.Prisma.ContentCreateNestedManyWithoutMessageInput,
    status: Prisma.MessageStatus,
    fromMe = false,
  ): Promise<Message> {
    return plainToClass(
      Message,
      await this.prismaService.message.upsert({
        where: {
          channelId_accountId_externalId: {
            channelId: chat.channelId,
            accountId: chat.accountId,
            externalId,
          },
        },
        create: {
          projectId: chat.projectId,
          chat: {
            connect: {
              projectId_channelId_accountId: {
                projectId: chat.projectId,
                channelId: chat.channelId,
                accountId: chat.accountId,
              },
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
          chat: true,
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
