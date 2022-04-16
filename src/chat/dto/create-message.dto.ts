import { AttachmentType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
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
  @ValidateIf(({ attachments, buttons }) => {
    if (Array.isArray(attachments) && Array.isArray(buttons)) {
      return attachments.length === 0 && buttons.length === 0;
    }

    return true;
  })
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  text?: string;

  @Type(() => Attachment)
  @ValidateNested({ each: true })
  @IsArray()
  attachments: Attachment[];

  @IsArray()
  @IsOptional()
  buttons?: any[];
}
