import { Module } from '@nestjs/common';
import { WebhookDispatcher } from 'src/common/webhook-dispatcher.service';
import { PrismaService } from 'src/prisma.service';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  controllers: [TelegramController],
  providers: [TelegramService, PrismaService, WebhookDispatcher],
})
export class TelegramModule {}
