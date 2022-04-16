import { Chat } from '@prisma/client';
import { BaseApiChannel } from './base.api-channel';
import { IMessage } from '../interfaces/message.interface';

export class WhatsAppApiChannel extends BaseApiChannel {
  async sendMessage<T>(chat: Chat, message: IMessage): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
}
