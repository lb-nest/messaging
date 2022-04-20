import { NotImplementedException } from '@nestjs/common';
import { Chat } from '@prisma/client';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { ChannelStrategy } from './channel.strategy';

export class WebchatStrategy extends ChannelStrategy {
  send(chat: Chat, message: CreateMessageDto): Promise<any[]> {
    throw new NotImplementedException();
  }
}
