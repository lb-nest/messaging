import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [MessageController],
  providers: [PrismaService, MessageService],
})
export class MessageModule {}
