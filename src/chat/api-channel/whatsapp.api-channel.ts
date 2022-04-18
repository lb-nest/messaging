import { NotImplementedException } from '@nestjs/common';
import { Chat } from '@prisma/client';
import { CreateMessageDto } from '../dto/create-message.dto';
import { BaseApiChannel } from './base.api-channel';

export class WhatsappApiChannel extends BaseApiChannel {
  async sendMessage<T>(chat: Chat, message: CreateMessageDto): Promise<T[]> {
    throw new NotImplementedException();
  }
}
