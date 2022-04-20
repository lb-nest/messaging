import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  controllers: [TelegramController],
  providers: [TelegramService, PrismaService, WebhookSenderService],
})
export class TelegramModule {}
