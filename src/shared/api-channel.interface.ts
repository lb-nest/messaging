import { ConfigService } from '@nestjs/config';
import { Channel, Chat } from '@prisma/client';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';

export abstract class ApiChannel {
  constructor(
    protected readonly channel: Channel,
    protected readonly prismaService: PrismaService,
    protected readonly configService: ConfigService,
  ) {}

  abstract send(chat: Chat, message: CreateMessageDto): Promise<any[]>;
}
