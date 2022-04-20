import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { ApiChannelRepository } from 'src/shared/api-channel.repository';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
  imports: [ConfigModule],
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService, ApiChannelRepository],
})
export class ChannelModule {}
