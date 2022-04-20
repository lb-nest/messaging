import { Injectable } from '@nestjs/common';
import { ChannelType } from '@prisma/client';
import { TelegramApiChannel } from './telegram.api-channel';
import { WebchatApiChannel } from './webchat.api-channel';
import { WhatsappApiChannel } from './whatsapp.api-channel';

@Injectable()
export class ApiChannelRepository {
  [ChannelType.Telegram] = TelegramApiChannel;
  [ChannelType.Webchat] = WebchatApiChannel;
  [ChannelType.Whatsapp] = WhatsappApiChannel;
}
