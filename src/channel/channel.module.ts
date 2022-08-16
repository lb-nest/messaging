import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3.service';
import { ChannelController } from './channel.controller';
import { ChannelRepository } from './channel.repository';
import { ChannelService } from './channel.service';

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [ChannelController],
  providers: [PrismaService, S3Service, ChannelRepository, ChannelService],
})
export class ChannelModule {}
