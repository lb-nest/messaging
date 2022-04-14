import { ChannelStatus, ChannelType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsEnum(ChannelStatus)
  status: ChannelStatus;

  @IsString()
  accountId: string;

  @IsString()
  token: string;
}
