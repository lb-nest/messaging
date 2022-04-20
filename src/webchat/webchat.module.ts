import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { WebchatController } from './webchat.controller';
import { WebchatService } from './webchat.service';

@Module({
  controllers: [WebchatController],
  providers: [WebchatService, PrismaService, WebhookSenderService],
})
export class WebchatModule {}
