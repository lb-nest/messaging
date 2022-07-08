import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3.service';
import { ApiChannelRepository } from 'src/shared/api-channel.repository';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
  imports: [ConfigModule],
  controllers: [ChannelController],
  providers: [
    ChannelService,
    PrismaService,
    S3Service,
    ApiChannelRepository,
    WebhookSenderService,
  ],
  exports: [ChannelService],
})
export class ChannelModule {}
