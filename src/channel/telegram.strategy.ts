import { ConfigService } from '@nestjs/config';
import { ChannelStatus } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/prisma.service';
import { ChannelStrategy } from './channel.strategy';
import { CreateChannelDto } from './dto/create-channel.dto';

export class TelegramStrategy implements ChannelStrategy {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly configService: ConfigService,
  ) {}

  async create(
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<any> {
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
}
