import { ConfigService } from '@nestjs/config';
import Prisma from '@prisma/client';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { MessageWithChatId } from 'src/chat/entities/message-with-chat-id.entity';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3.service';
import { WebhookSenderService } from './webhook-sender.service';

export abstract class ApiChannel<T = unknown> {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly configService: ConfigService,
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

  abstract handle(
    channel: Prisma.Channel,
    event: T,
    webhookSenderService: WebhookSenderService,
  ): Promise<unknown>;
}
