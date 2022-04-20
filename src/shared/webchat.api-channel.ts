import { NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Chat } from '@prisma/client';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiChannel } from './api-channel.interface';

export class WebchatApiChannel extends ApiChannel {
  static async create(
    prismaService: PrismaService,
    configService: ConfigService,
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<any> {
    throw new NotImplementedException();
  }

  static async createContact(message: unknown): Promise<any> {
    throw new NotImplementedException();
  }

  static async createAttachment(message: unknown): Promise<any> {
    throw new NotImplementedException();
  }

  async send(chat: Chat, message: CreateMessageDto): Promise<any[]> {
    throw new NotImplementedException();
  }
}
