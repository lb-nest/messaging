import Prisma from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Channel implements Prisma.Channel {
  id: number;

  @Exclude()
  projectId: number;

  name: string;

  type: Prisma.ChannelType;

  status: Prisma.ChannelStatus;

  @Exclude()
  accountId: string | null;

  @Exclude()
  token: any;
}
