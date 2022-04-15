import { Chat } from '@prisma/client';
import { BaseApiChannel } from './base.api-channel';
import { IMessage } from './interfaces/message.interface';

export class WhatsAppApiChannel extends BaseApiChannel {
  async sendMessage(chat: Chat, message: IMessage): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
}
