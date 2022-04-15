import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { ChatModule } from './chat/chat.module';
import { TelegramModule } from './telegram/telegram.module';
import { HsmModule } from './hsm/hsm.module';

@Module({
  imports: [AuthModule, ChannelModule, ChatModule, HsmModule, TelegramModule],
})
export class AppModule {}
