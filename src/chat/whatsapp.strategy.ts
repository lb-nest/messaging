import { NotImplementedException } from '@nestjs/common';
import { Channel, Chat } from '@prisma/client';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';
import { ChannelStrategy } from './channel.strategy';

export class WhatsappStrategy implements ChannelStrategy {
  constructor(
    private readonly channel: Channel,
    private readonly prismaService: PrismaService,
  ) {}

  send(chat: Chat, message: CreateMessageDto): Promise<any[]> {
    throw new NotImplementedException();
  }
}
