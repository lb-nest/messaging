import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@User() user: any, @Body() createChannelDto: CreateChannelDto) {
    return this.channelService.create(user.project.id, createChannelDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@User() user: any) {
    return this.channelService.findAll(user.project.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.channelService.findOne(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@User() user: any, @Param('id') id: string) {
    return this.channelService.delete(user.project.id, Number(id));
  }
}
