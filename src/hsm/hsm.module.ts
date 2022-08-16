import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ApprovalService } from './approval.service';
import { HsmController } from './hsm.controller';
import { HsmService } from './hsm.service';

@Module({
  controllers: [HsmController],
  providers: [PrismaService, ApprovalService, HsmService],
})
export class HsmModule {}
