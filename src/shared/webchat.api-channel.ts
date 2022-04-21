import { NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelStatus, Chat } from '@prisma/client';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiChannel } from './api-channel.interface';

export class WebchatApiChannel extends ApiChannel {
  static async create(
    projectId: number,
    data: CreateChannelDto,
    prisma: PrismaService,
    config: ConfigService,
  ): Promise<any> {
    const channel = await prisma.channel.create({
      data: {
        projectId,
        ...data,
        status: ChannelStatus.Connected,
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });

    return channel;
  }

  static async handleEvent(...args: any[]) {
    console.log(args[0], args[1]);
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
