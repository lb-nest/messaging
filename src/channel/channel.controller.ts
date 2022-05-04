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
import { Auth } from 'src/auth/auth.decorator';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Channel))
  @Post()
  create(
    @Auth() user: TokenPayload,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    return this.channelService.create(user.project.id, createChannelDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Channel))
  @Get()
  findAll(@Auth() user: TokenPayload) {
    return this.channelService.findAll(user.project.id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Channel))
  @Get(':id')
  findOne(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.channelService.findOne(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Channel))
  @Patch(':id')
  update(
    @Auth() user: TokenPayload,
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
  @UseInterceptors(new TransformInterceptor(Channel))
  @Delete(':id')
  delete(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.channelService.delete(user.project.id, Number(id));
  }

  @Post(':id/webhook')
  handleEvent(@Param('id') id: string, @Body() event: any) {
    return this.channelService.handleEvent(Number(id), event);
  }
}
