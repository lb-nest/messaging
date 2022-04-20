import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ApiChannelRepository } from 'src/shared/api-channel.repository';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    MessageService,
    PrismaService,
    WebhookSenderService,
    ApiChannelRepository,
  ],
})
export class ChatModule {}
