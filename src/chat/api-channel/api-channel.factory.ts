import { Injectable } from '@nestjs/common';
import { Channel, ChannelType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { BaseApiChannel } from './base.api-channel';
import { TelegramApiChannel } from './telegram.api-channel';
import { WhatsappApiChannel } from './whatsapp.api-channel';

@Injectable()
export class ApiChannelFactory {
  constructor(private readonly prismaService: PrismaService) {}

  create(channel: Channel): BaseApiChannel {
    const channels = {
      [ChannelType.Telegram]: TelegramApiChannel,
      [ChannelType.Whatsapp]: WhatsappApiChannel,
    };

    return new channels[channel.type](channel, this.prismaService);
  }
}
