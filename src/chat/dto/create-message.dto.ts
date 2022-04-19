import { AttachmentType } from '@prisma/client';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class Attachment {
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateMessageDto {
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  text?: string;

  @Type(() => Attachment)
  @ValidateNested({ each: true })
  @IsArray()
  attachments: Attachment[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }: TransformFnParams) => value ?? undefined)
  buttons?: any[];
}
