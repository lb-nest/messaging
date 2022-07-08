import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { CreateChatWithoutChannelIdDto } from './create-chat-without-channel-id.dto';

export class ImportChatsDto {
  @IsInt()
  channelId: number;

  @Type(() => CreateChatWithoutChannelIdDto)
  @ValidateNested({ each: true })
  chats: CreateChatWithoutChannelIdDto[];
}
