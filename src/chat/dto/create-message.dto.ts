import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Attachment } from './create-attachment.dto';

export class CreateMessageDto {
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  text?: string;

  @Type(() => Attachment)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  attachments: Attachment[] = [];

  @IsOptional()
  @IsArray()
  @Transform(({ value }: TransformFnParams) => value ?? undefined)
  buttons?: any[];
}
