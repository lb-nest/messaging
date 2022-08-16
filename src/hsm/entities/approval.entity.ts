import Prisma from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { Channel } from 'src/channel/entities/channel.entity';

export class Approval implements Prisma.Approval {
  @Exclude()
  channelId: number;

  @Type(() => Channel)
  channel: Channel;

  @Exclude()
  hsmId: number;

  @Exclude()
  externalId: string;

  status: Prisma.ApprovalStatus;

  rejectedReason: string | null;
}
