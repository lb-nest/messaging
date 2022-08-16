import { ChannelType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateChannelDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @Transform(({ value }) => value?.trim())
  @ValidateIf(
    (object: CreateChannelDto) => object.type === ChannelType.Whatsapp,
  )
  @IsString()
  @IsNotEmpty()
  accountId?: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  token: string;
}
