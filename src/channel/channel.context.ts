import { Injectable } from '@nestjs/common';
import { ChannelStrategy } from './channel.strategy';
import { CreateChannelDto } from './dto/create-channel.dto';

@Injectable()
export class ChannelContext {
  private strategy: ChannelStrategy;

  setStrategy(strategy: ChannelStrategy) {
    this.strategy = strategy;
  }

  create(projectId: number, createChannelDto: CreateChannelDto) {
    return this.strategy.create(projectId, createChannelDto);
  }
}
