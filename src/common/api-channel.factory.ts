import { Injectable } from '@nestjs/common';
import { Channel, ChannelType } from '@prisma/client';
import { BaseApiChannel } from './api-channel/base.api-channel';
import { TelegramApiChannel } from './api-channel/telegram.api-channel';
import { WhatsAppApiChannel } from './api-channel/whatsapp.api-channel';

@Injectable()
export class ApiChannelFactory {
  create(channel: Channel) {
    const channels = {
      [ChannelType.Telegram]: TelegramApiChannel,
      [ChannelType.Whatsapp]: WhatsAppApiChannel,
    };

    return new channels[channel.type](channel) as BaseApiChannel;
  }
}
