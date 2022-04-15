import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';

@Injectable()
export class HsmService {
  constructor(private readonly prismaService: PrismaService) {}

  create(projectId: number, createHsmDto: CreateHsmDto) {
    return this.prismaService.templateMessage.create({
      data: {
        projectId,
        ...createHsmDto,
      },
    });
  }

  findAll(projectId: number) {
    return this.prismaService.templateMessage.findMany({
      where: {
        projectId,
      },
    });
  }

  findOne(projectId: number, id: number) {
    return this.prismaService.templateMessage.findUnique({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
    });
  }

  update(projectId: number, id: number, updateHsmDto: UpdateHsmDto) {
    return this.prismaService.templateMessage.update({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      data: updateHsmDto,
    });
  }

  delete(projectId: number, id: number) {
    return this.prismaService.templateMessage.delete({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
    });
  }
}
