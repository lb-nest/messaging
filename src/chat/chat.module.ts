import { Module } from '@nestjs/common';
import { ApiChannelFactory } from 'src/common/api-channel.factory';
import { PrismaService } from 'src/prisma.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, MessageService, PrismaService, ApiChannelFactory],
})
export class ChatModule {}
