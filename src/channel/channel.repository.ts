import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { ChannelType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3.service';
import { BACKEND } from 'src/shared/constants/broker';
import { AbstractChannel } from './abstract.channel';
import { InstagramChannel } from './instagram.channel';
import { TelegramChannel } from './telegram.channel';
import { VkontakteChannel } from './vkontakte.channel';
import { WebchatChannel } from './webchat.channel';
import { WhatsappChannel } from './whatsapp.channel';

@Injectable()
export class ChannelRepository {
  constructor(
    private readonly configService: ConfigService,
    @Inject(BACKEND) private readonly client: ClientProxy,
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  private [ChannelType.Instagram] = InstagramChannel;
  private [ChannelType.Telegram] = TelegramChannel;
  private [ChannelType.Vkontakte] = VkontakteChannel;
  private [ChannelType.Webchat] = WebchatChannel;
  private [ChannelType.Whatsapp] = WhatsappChannel;

  get(type: ChannelType): AbstractChannel {
    return new this[type](
      this.configService,
      this.client,
      this.prismaService,
      this.s3Service,
    );
  }
}
