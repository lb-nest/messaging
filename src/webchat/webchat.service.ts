import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { WebchatEventDto } from './dto/webchat-event.dto';

@Injectable()
export class WebchatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly webhookSenderService: WebhookSenderService,
  ) {}

  async handleEvents(channelId: number, event: WebchatEventDto) {
    console.log(event);
  }
}
