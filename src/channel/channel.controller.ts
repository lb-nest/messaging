import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @MessagePattern('createChannel')
  @UseInterceptors(new PlainToClassInterceptor(Channel))
  create(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    return this.channelService.create(projectId, createChannelDto);
  }

  @MessagePattern('findAllChannels')
  @UseInterceptors(new PlainToClassInterceptor(Channel))
  findAll(
    @Payload('projectId', ParseIntPipe) projectId: number,
  ): Promise<Channel[]> {
    return this.channelService.findAll(projectId);
  }

  @MessagePattern('findOneChannel')
  @UseInterceptors(new PlainToClassInterceptor(Channel))
  findOne(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload('id', ParseIntPipe) id: number,
  ): Promise<Channel> {
    return this.channelService.findOne(projectId, id);
  }

  @MessagePattern('updateChannel')
  @UseInterceptors(new PlainToClassInterceptor(Channel))
  update(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.channelService.update(projectId, updateChannelDto);
  }

  @MessagePattern('removeChannel')
  @UseInterceptors(new PlainToClassInterceptor(Channel))
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
