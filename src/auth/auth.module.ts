import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BearerStrategy } from './bearer.strategy';

@Module({
  imports: [ConfigModule],
  providers: [BearerStrategy],
})
export class AuthModule {}
