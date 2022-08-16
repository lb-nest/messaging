import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateAttachmentDto } from './create-attachment.dto';
import { CreateButtonDto } from './create-button.dto';

export class CreateMessageDto {
  @IsInt()
  chatId: number;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  text?: string;

  @Type(() => CreateAttachmentDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  attachments?: CreateAttachmentDto[];

  @Type(() => CreateButtonDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  buttons?: CreateButtonDto[];
}
