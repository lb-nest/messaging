import Prisma from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { Message } from 'src/message/entities/message.entity';

export class Chat implements Prisma.Chat {
  @Exclude({ toPlainOnly: true })
  projectId: number;

  channelId: number;

  accountId: string;

  isNew: boolean;

  unreadCount: number;

  @Type(() => Message)
  messages: Message[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
