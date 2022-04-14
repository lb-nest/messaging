import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TemplateMessageController } from './template-message.controller';
import { TemplateMessageService } from './template-message.service';

@Module({
  controllers: [TemplateMessageController],
  providers: [TemplateMessageService, PrismaService],
})
export class TemplateMessageModule {}
