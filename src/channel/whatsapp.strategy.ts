import { NotImplementedException } from '@nestjs/common';
import { ChannelStrategy } from './channel.strategy';
import { CreateChannelDto } from './dto/create-channel.dto';

export class WhatsappStrategy extends ChannelStrategy {
  create(projectId: number, createChannelDto: CreateChannelDto): Promise<any> {
    throw new NotImplementedException();
  }
}
