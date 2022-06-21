import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ApprovalStatus, ChannelType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { Approval } from './entities/approval.entity';

@Injectable()
export class ApprovalService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    projectId: number,
    id: number,
    createApprovalDto: CreateApprovalDto,
  ): Promise<Approval> {
    const channel = await this.prismaService.channel.findUnique({
      where: {
        projectId_id: {
          projectId,
          id: createApprovalDto.channelId,
        },
      },
    });

    if (!channel || channel.type !== ChannelType.Whatsapp) {
      throw new BadRequestException();
    }

    const approval = await this.prismaService.approval
      .create({
        data: {
          templateId: id,
          status: ApprovalStatus.Requested,
          ...createApprovalDto,
        },
        include: {
          channel: true,
        },
      })
      .catch(() => undefined);

    if (!approval) {
      throw new ConflictException();
    }

    return approval;
  }
}
