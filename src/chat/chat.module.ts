import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChannelModule } from 'src/channel/channel.module';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3.service';
import { ApiChannelRepository } from 'src/shared/api-channel.repository';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';

@Module({
  imports: [ConfigModule, ChannelModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    MessageService,
    PrismaService,
    S3Service,
    WebhookSenderService,
    ApiChannelRepository,
  ],
})
export class ChatModule {}
