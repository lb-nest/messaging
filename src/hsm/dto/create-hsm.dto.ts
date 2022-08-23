import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateAttachmentDto } from 'src/chat/dto/create-attachment.dto';
import { CreateButtonDto } from 'src/chat/dto/create-button.dto';

export class CreateHsmDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  code: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  text: string;

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
