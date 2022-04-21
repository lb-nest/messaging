import { NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Chat } from '@prisma/client';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiChannel } from './api-channel.interface';

export class WhatsappApiChannel extends ApiChannel {
  static async create(
    projectId: number,
    data: CreateChannelDto,
    prisma: PrismaService,
    config: ConfigService,
  ): Promise<any> {
    throw new NotImplementedException();
  }

  static async handleEvent(...args: any[]) {
    console.log(args[0], args[1]);
  }

  async send(chat: Chat, message: CreateMessageDto): Promise<any[]> {
    throw new NotImplementedException();
  }

  private static async createContact(message: unknown): Promise<any> {
    throw new NotImplementedException();
  }

  private static async createAttachment(message: unknown): Promise<any> {
    throw new NotImplementedException();
  }
}
