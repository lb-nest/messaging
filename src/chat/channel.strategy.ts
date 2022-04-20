import { Chat } from '@prisma/client';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';

export interface ChannelStrategy {
  send(chat: Chat, message: CreateMessageDto): Promise<any[]>;
}
