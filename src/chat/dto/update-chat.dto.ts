import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional } from 'class-validator';
import { CreateChatDto } from './create-chat.dto';
import { FindOneChatDto } from './find-one-chat.dto';

export class UpdateChatDto extends IntersectionType(
  FindOneChatDto,
  PartialType(CreateChatDto),
) {
  @IsOptional()
  @IsInt()
  unreadCount?: number;
}
