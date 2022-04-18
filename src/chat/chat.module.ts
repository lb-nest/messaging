import { Module } from '@nestjs/common';
import { ApiChannelFactory } from 'src/chat/api-channel/api-channel.factory';
import { PrismaService } from 'src/prisma.service';
import { WebhookDispatcher } from 'src/shared/webhook-dispatcher.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    MessageService,
    PrismaService,
    ApiChannelFactory,
    WebhookDispatcher,
  ],
})
export class ChatModule {}
