import { Channel, Chat } from '@prisma/client';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';

export abstract class ApiChannel {
  constructor(
    protected readonly channel: Channel,
    protected readonly prismaService: PrismaService,
  ) {}

  abstract send(chat: Chat, message: CreateMessageDto): Promise<any[]>;
}
