import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Auth } from 'src/auth/auth.decorator';
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Controller()
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @MessagePattern('channels.create')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Channel))
  create(
    @Auth() auth: TokenPayload,
    @Payload('payload') createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    return this.channelService.create(auth.project.id, createChannelDto);
  }

  @MessagePattern('channels.findAll')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Channel))
  findAll(@Auth() auth: TokenPayload): Promise<Channel[]> {
    return this.channelService.findAll(auth.project.id);
  }

  @MessagePattern('channels.findOne')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Channel))
  findOne(
    @Auth() auth: TokenPayload,
    @Payload('payload', ParseIntPipe) id: number,
  ): Promise<Channel> {
    return this.channelService.findOne(auth.project.id, id);
  }

  @MessagePattern('channels.update')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Channel))
  update(
    @Auth() auth: TokenPayload,
    @Payload('payload') updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.channelService.update(auth.project.id, updateChannelDto);
  }

  @MessagePattern('channels.remove')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Channel))
  remove(
    @Auth() auth: TokenPayload,
    @Payload('payload', ParseIntPipe) id: number,
  ): Promise<Channel> {
    return this.channelService.remove(auth.project.id, id);
  }

  @Post(':id/webhook')
  handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() event: any,
  ): Promise<unknown> {
    return this.channelService.handle(id, event);
  }
}
