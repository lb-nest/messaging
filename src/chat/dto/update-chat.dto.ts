import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';
import { CreateChatDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(
  OmitType(CreateChatDto, ['channelId']),
) {
  @IsInt()
  id: number;
}
