import { AttachmentType } from '@prisma/client';
import { IsEnum, IsUrl, IsOptional, IsString } from 'class-validator';

export class Attachment {
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  name?: string;
}
