import { CreateChannelDto } from './dto/create-channel.dto';

export interface ChannelStrategy {
  create(projectId: number, createChannelDto: CreateChannelDto): Promise<any>;
}
