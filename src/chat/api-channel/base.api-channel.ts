import { Channel, Chat } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from '../dto/create-message.dto';

export abstract class BaseApiChannel {
  constructor(
    protected readonly channel: Channel,
    protected readonly prismaService: PrismaService,
  ) {}

  abstract sendMessage<T>(chat: Chat, message: CreateMessageDto): Promise<T[]>;
}
