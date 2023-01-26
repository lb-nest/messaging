import { ChannelType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  token: string;
}
