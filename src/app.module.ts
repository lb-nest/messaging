import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { ChatModule } from './chat/chat.module';
import { TemplateMessageModule } from './template-message/template-message.module';

@Module({
  imports: [AuthModule, ChannelModule, ChatModule, TemplateMessageModule],
})
export class AppModule {}
