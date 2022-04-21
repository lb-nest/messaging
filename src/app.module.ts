import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { ChatModule } from './chat/chat.module';
import { HsmModule } from './hsm/hsm.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [AuthModule, ChannelModule, ChatModule, HsmModule, WebhookModule],
})
export class AppModule {}
