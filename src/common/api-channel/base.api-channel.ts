import { Channel, Chat } from '@prisma/client';
import { IMessage } from './interfaces/message.interface';

export abstract class BaseApiChannel {
  constructor(protected readonly channel: Channel) {}

  abstract sendMessage<T>(chat: Chat, message: IMessage): Promise<T[]>;
}
