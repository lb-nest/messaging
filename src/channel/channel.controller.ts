import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { User } from 'src/auth/user.decorator';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Channel))
  @Post()
  create(@User() user: any, @Body() createChannelDto: CreateChannelDto) {
    return this.channelService.create(user.project.id, createChannelDto);
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Channel))
  @Get()
  findAll(@User() user: any) {
    return this.channelService.findAll(user.project.id);
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Channel))
  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.channelService.findOne(user.project.id, Number(id));
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Channel))
  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.channelService.update(
      user.project.id,
      Number(id),
      updateChannelDto,
    );
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Channel))
  @Delete(':id')
  delete(@User() user: any, @Param('id') id: string) {
    return this.channelService.delete(user.project.id, Number(id));
  }

  @Post(':id/webhook')
  handle(@Param('id') id: string, @Body() event: any) {
    return this.channelService.handle(Number(id), event);
  }
}
