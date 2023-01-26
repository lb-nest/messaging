import Prisma from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { Content } from './content.entity';

export class Message implements Prisma.Message {
  id: number;

  @Exclude()
  projectId: number;

  // @Exclude()
  channelId: number;

  // @Exclude()
  accountId: string;

  fromMe: boolean;

  status: Prisma.MessageStatus;

  failedReason: string | null;

  @Exclude()
  externalId: string;

  @Type(() => Content)
  content: Content[];

  createdAt: Date;

  updatedAt: Date;
}
