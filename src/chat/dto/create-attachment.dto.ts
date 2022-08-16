import { AttachmentType } from '@prisma/client';
import { IsEnum, IsUrl, IsOptional, IsString } from 'class-validator';

export class CreateAttachmentDto {
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  name?: string;
}
