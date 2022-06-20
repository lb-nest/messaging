import { NotImplementedException } from '@nestjs/common';
import * as Prisma from '@prisma/client';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { MessageWithChatId } from 'src/chat/entities/message-with-chat-id.entity';
import { ApiChannel } from './api-channel.interface';
import { WebhookSenderService } from './webhook-sender.service';

export class InstagramApiChannel extends ApiChannel {
  async create(
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    throw new NotImplementedException();
  }

  async send(
    channel: Prisma.Channel,
    chat: Prisma.Chat,
    message: CreateMessageDto,
  ): Promise<MessageWithChatId[]> {
    throw new NotImplementedException();
  }

  async handle(
    channel: Prisma.Channel,
    event: any,
    webhookSenderService: WebhookSenderService,
  ): Promise<void> {
    throw new NotImplementedException();
  }
}
