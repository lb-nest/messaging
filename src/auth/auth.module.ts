import { Module } from '@nestjs/common';
import { BearerStrategy } from './bearer.strategy';

@Module({
  providers: [BearerStrategy],
})
export class AuthModule {}
