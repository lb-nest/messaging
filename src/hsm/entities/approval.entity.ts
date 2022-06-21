import { ApprovalStatus } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { Channel } from 'src/channel/entities/channel.entity';

export class Approval {
  @Exclude()
  channelId: number;

  @Type(() => Channel)
  channel: Channel;

  @Exclude()
  templateId: number;

  status: ApprovalStatus;

  rejectedReason?: string;
}
