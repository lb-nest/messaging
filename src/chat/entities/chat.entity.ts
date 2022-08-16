import Prisma from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { Contact } from './contact.entity';
import { Message } from './message.entity';

export class Chat implements Prisma.Chat {
  id: number;

  @Exclude()
  channelId: number;

  @Type(() => Contact)
  contact: Contact;

  @Exclude()
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
