import { ChannelType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsString()
  token: string;
}
