import { Injectable } from '@nestjs/common';
import { Chat } from '@prisma/client';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { ChannelStrategy } from './channel.strategy';

@Injectable()
export class ChannelContext {
  private strategy: ChannelStrategy;

  setStrategy(strategy: ChannelStrategy) {
    this.strategy = strategy;
  }

  send(chat: Chat, message: CreateMessageDto) {
    return this.strategy.send(chat, message);
  }
}
