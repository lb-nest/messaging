import Prisma from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Channel implements Prisma.Channel {
  id: number;

  @Exclude()
  projectId: number;

  type: Prisma.ChannelType;

  name: string;

  @Exclude()
  accountId: string;

  @Exclude()
  token: any;

  status: Prisma.ChannelStatus;

  failedReason: string | null;

  createdAt: Date;

  updatedAt: Date;
}
