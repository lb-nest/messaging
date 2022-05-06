import { ChannelType } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreateChannelDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @ValidateIf((object) => object.type === ChannelType.Whatsapp)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  accountId?: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  token: string;
}
