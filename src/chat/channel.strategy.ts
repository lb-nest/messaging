import { Channel, Chat } from '@prisma/client';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';

export abstract class ChannelStrategy {
  constructor(
    protected channel: Channel,
    protected readonly prismaService: PrismaService,
  ) {}

  abstract send(chat: Chat, message: CreateMessageDto): Promise<any[]>;
}
