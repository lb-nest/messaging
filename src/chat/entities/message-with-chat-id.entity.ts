import { Chat } from './chat.entity';
import { Message } from './message.entity';

export class MessageWithChatId extends Message {
  chat: Pick<Chat, 'id'>;
}
