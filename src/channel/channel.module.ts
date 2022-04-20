import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { ChannelContext } from './channel.context';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
  imports: [ConfigModule],
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService, ChannelContext],
})
export class ChannelModule {}
