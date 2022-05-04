import { ChannelStatus, ChannelType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Channel {
  id: number;

  @Exclude()
  projectId: number;

  name: string;

  type: ChannelType;

  status: ChannelStatus;

  @Exclude()
  token: string;
}
