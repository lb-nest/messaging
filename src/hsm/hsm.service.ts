import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { Hsm } from './entities/hsm.entity';

@Injectable()
export class HsmService {
  constructor(private readonly prismaService: PrismaService) {}

  create(projectId: number, createHsmDto: CreateHsmDto): Promise<Hsm> {
    return this.prismaService.hsm.create({
      data: {
        projectId,
        ...createHsmDto,
        attachments: createHsmDto.attachments as any,
        buttons: createHsmDto.buttons as any,
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

  findAll(projectId: number): Promise<Hsm[]> {
    return this.prismaService.hsm.findMany({
      where: {
        projectId,
      },
      orderBy: {
        id: 'desc',
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

  findOne(projectId: number, id: number): Promise<Hsm> {
    return this.prismaService.hsm.findUniqueOrThrow({
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

  update(projectId: number, updateHsmDto: UpdateHsmDto): Promise<Hsm> {
    return this.prismaService.hsm.update({
      where: {
        projectId_id: {
          projectId,
          id: updateHsmDto.id,
        },
      },
      data: {
        ...updateHsmDto,
        attachments: updateHsmDto.attachments as any,
        buttons: updateHsmDto.buttons as any,
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

  async remove(projectId: number, id: number): Promise<Hsm> {
    return this.prismaService.hsm.delete({
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
