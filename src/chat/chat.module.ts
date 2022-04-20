import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { ChannelContext } from './channel.context';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    MessageService,
    PrismaService,
    ChannelContext,
    WebhookSenderService,
  ],
})
export class ChatModule {}
