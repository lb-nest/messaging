import { MessageStatus } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { Content } from './content.entity';

export class Message {
  id: number;

  @Exclude()
  chatId: number;

  fromMe: boolean;

  status: MessageStatus;

  @Exclude()
  externalId: string;

  @Type(() => Content)
  content: Content[];

  createdAt: Date;

  updatedAt: Date;
}
