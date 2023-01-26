import { NotImplementedException } from '@nestjs/common';
import Prisma from '@prisma/client';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { Message } from 'src/message/entities/message.entity';
import { AbstractChannel } from './abstract.channel';

export class InstagramChannel extends AbstractChannel {
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
  ): Promise<Message[]> {
    throw new NotImplementedException();
  }

  async handle(channel: Prisma.Channel, event: any): Promise<void> {
    throw new NotImplementedException();
  }
}
