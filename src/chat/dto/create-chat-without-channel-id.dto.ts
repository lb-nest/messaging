import { OmitType } from '@nestjs/mapped-types';
import { CreateChatDto } from './create-chat.dto';

export class CreateChatWithoutChannelIdDto extends OmitType(CreateChatDto, [
  'channelId',
]) {}
