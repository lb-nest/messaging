import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { Hsm } from './entities/hsm.entity';

@Injectable()
export class HsmService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(projectId: number, createHsmDto: CreateHsmDto): Promise<Hsm> {
    return this.prismaService.templateMessage.create({
      data: {
        projectId,
        ...createHsmDto,
      },
      include: {
        approval: {
          include: {
            channel: true,
          },
        },
      },
    });
  }

  async findAll(projectId: number): Promise<Hsm[]> {
    return this.prismaService.templateMessage.findMany({
      where: {
        projectId,
      },
      include: {
        approval: {
          include: {
            channel: true,
          },
        },
      },
    });
  }

  async findOne(projectId: number, id: number): Promise<Hsm> {
    return this.prismaService.templateMessage.findUnique({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      include: {
        approval: {
          include: {
            channel: true,
          },
        },
      },
    });
  }

  async update(
    projectId: number,
    id: number,
    updateHsmDto: UpdateHsmDto,
  ): Promise<Hsm> {
    return this.prismaService.templateMessage.update({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      data: updateHsmDto,
      include: {
        approval: {
          include: {
            channel: true,
          },
        },
      },
    });
  }

  async delete(projectId: number, id: number): Promise<Hsm> {
    return this.prismaService.templateMessage.delete({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      include: {
        approval: {
          include: {
            channel: true,
          },
        },
      },
    });
  }
}
