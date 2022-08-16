import { Injectable } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { Approval } from './entities/approval.entity';

@Injectable()
export class ApprovalService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    projectId: number,
    createApprovalDto: CreateApprovalDto,
  ): Promise<Approval> {
    return this.prismaService.approval.create({
      data: {
        channel: {
          connect: {
            projectId_id: {
              projectId,
              id: createApprovalDto.channelId,
            },
          },
        },
        hsm: {
          connect: {
            projectId_id: {
              projectId,
              id: createApprovalDto.hsmId,
            },
          },
        },
        status: ApprovalStatus.Submitted,
      },
      include: {
        channel: true,
      },
    });
  }
}
