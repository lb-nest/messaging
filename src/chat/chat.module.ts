import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { ChannelModule } from 'src/channel/channel.module';
import { ChannelRepository } from 'src/channel/channel.repository';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [forwardRef(() => AppModule), ChannelModule],
  controllers: [ChatController],
  providers: [ChannelRepository, PrismaService, S3Service, ChatService],
})
export class ChatModule {}
