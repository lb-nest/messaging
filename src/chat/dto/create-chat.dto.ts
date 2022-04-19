import { Transform, TransformFnParams } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsInt()
  channelId: number;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  username: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  name: string;
}
