import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { Hsm } from './entities/hsm.entity';

@Injectable()
export class HsmService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(projectId: number, createHsmDto: CreateHsmDto): Promise<Hsm> {
    const hsm = await this.prismaService.templateMessage
      .create({
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
      })
      .catch(() => undefined);

    if (!hsm) {
      throw new ConflictException();
    }

    return hsm;
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
    const hsm = await this.prismaService.templateMessage.findUnique({
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

    if (!hsm) {
      throw new BadRequestException();
    }

    return hsm;
  }

  async update(
    projectId: number,
    id: number,
    updateHsmDto: UpdateHsmDto,
  ): Promise<Hsm> {
    const hsm = await this.prismaService.templateMessage
      .update({
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
      })
      .catch(() => undefined);

    if (!hsm) {
      throw new NotFoundException();
    }

    return hsm;
  }

  async delete(projectId: number, id: number): Promise<Hsm> {
    const hsm = await this.prismaService.templateMessage
      .delete({
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
      })
      .catch(() => undefined);

    if (!hsm) {
      throw new NotFoundException();
    }

    return hsm;
  }
}
