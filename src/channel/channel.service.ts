import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelStatus } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(projectId: number, createChannelDto: CreateChannelDto) {
    const bot = new TelegramBot(createChannelDto.token);
    await bot.getMe();

    const channel = await this.prismaService.channel.create({
      data: {
        projectId,
        ...createChannelDto,
        status: ChannelStatus.Connected,
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });

    const url = this.configService.get<string>('TELEGRAM_WEBHOOK');
    await bot.setWebHook(url.replace(':id', String(channel.id)));

    return channel;
  }

  findAll(projectId: number) {
    return this.prismaService.channel.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });
  }

  findOne(projectId: number, id: number) {
    return this.prismaService.channel.findUnique({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });
  }

  update(projectId: number, id: number, updateChannelDto: UpdateChannelDto) {
    return this.prismaService.channel.update({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      data: updateChannelDto,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });
  }

  delete(projectId: number, id: number) {
    return this.prismaService.channel.delete({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });
  }
}
