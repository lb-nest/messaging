import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { HsmController } from './hsm.controller';
import { HsmService } from './hsm.service';

@Module({
  controllers: [HsmController],
  providers: [HsmService, PrismaService],
})
export class HsmModule {}
