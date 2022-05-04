import { NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Prisma from '@prisma/client';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiChannel } from './api-channel.interface';
import { WebhookSenderService } from './webhook-sender.service';

export class WhatsappApiChannel extends ApiChannel {
  static async create(
    projectId: number,
    data: CreateChannelDto,
    prisma: PrismaService,
    config: ConfigService,
  ): Promise<Channel> {
    throw new NotImplementedException();
  }

  static async handleEvent(
    channel: Prisma.Channel,
    event: unknown,
    prisma: PrismaService,
    webhookSender: WebhookSenderService,
  ): Promise<'ok'> {
    throw new NotImplementedException();
  }

  async send(chat: Prisma.Chat, message: CreateMessageDto): Promise<any[]> {
    throw new NotImplementedException();
  }
}
