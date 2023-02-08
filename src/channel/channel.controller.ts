import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @SerializeOptions({
    type: Channel,
  })
  @MessagePattern('createChannel')
  create(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    return this.channelService.create(projectId, createChannelDto);
  }

  @SerializeOptions({
    type: Channel,
  })
  @MessagePattern('findAllChannels')
  findAll(
    @Payload('projectId', ParseIntPipe) projectId: number,
  ): Promise<Channel[]> {
    return this.channelService.findAll(projectId);
  }

  @SerializeOptions({
    type: Channel,
  })
  @MessagePattern('findOneChannel')
  findOne(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload('id', ParseIntPipe) id: number,
  ): Promise<Channel> {
    return this.channelService.findOne(projectId, id);
  }

  @SerializeOptions({
    type: Channel,
  })
  @MessagePattern('updateChannel')
  update(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.channelService.update(projectId, updateChannelDto);
  }

  @SerializeOptions({
    type: Channel,
  })
  @MessagePattern('removeChannel')
  remove(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload('id', ParseIntPipe) id: number,
  ): Promise<Channel> {
    return this.channelService.remove(projectId, id);
  }

  @Post(':id/webhook')
  handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() event: any,
  ): Promise<unknown> {
    return this.channelService.handle(id, event);
  }
}
