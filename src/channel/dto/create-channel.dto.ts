import { ChannelType } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateChannelDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  token: string;
}
