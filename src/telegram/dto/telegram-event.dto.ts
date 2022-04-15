import { Type } from 'class-transformer';
import {
  IsMimeType,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class User {
  @IsNumber()
  id: number;

  @IsString()
  username: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;
}

class Chat {
  @IsNumber()
  id: number;

  @IsString()
  type: string;
}

class Document {
  @IsString()
  file_name: string;

  @IsString()
  file_id: string;

  @IsNumber()
  file_size: number;

  @IsMimeType()
  mime_type: string;
}

class Photo {
  @IsString()
  file_id: string;

  @IsNumber()
  file_size: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;
}

class Video {
  @IsString()
  file_name: string;

  @IsString()
  file_id: string;

  @IsNumber()
  file_size: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  duration: number;
}

class Voice {
  @IsString()
  file_id: string;

  @IsNumber()
  file_size: number;

  @IsString()
  mime_type: string;

  @IsNumber()
  duration: number;
}

class Audio {
  @IsString()
  file_name: string;

  @IsString()
  file_id: string;

  @IsNumber()
  file_size: number;

  @IsString()
  mime_type: string;

  @IsNumber()
  duration: number;
}

class Message {
  @IsNumber()
  message_id: number;

  @Type(() => User)
  @ValidateNested()
  from: User;

  @Type(() => Chat)
  @ValidateNested()
  chat: Chat;

  @IsNumber()
  date: number;

  @Type(() => Document)
  @ValidateNested()
  document?: Document;

  @Type(() => Photo)
  @ValidateNested({ each: true })
  photo?: Photo[];

  @Type(() => Video)
  @ValidateNested()
  video?: Video;

  @Type(() => Voice)
  @ValidateNested()
  voice?: Voice;

  @Type(() => Audio)
  @ValidateNested()
  audio?: Audio;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  caption?: string;
}

export class TelegramEventDto {
  @IsNumber()
  update_id: number;

  @Type(() => Message)
  @ValidateNested()
  message: Message;
}
