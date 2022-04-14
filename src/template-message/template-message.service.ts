import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTemplateMessageDto } from './dto/create-template-message.dto';
import { UpdateTemplateMessageDto } from './dto/update-template-message.dto';

@Injectable()
export class TemplateMessageService {
  constructor(private readonly prismaService: PrismaService) {}

  create(
    projectId: number,
    createTemplateMessageDto: CreateTemplateMessageDto,
  ) {
    return this.prismaService.templateMessage.create({
      data: {
        projectId,
        ...createTemplateMessageDto,
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

  update(
    projectId: number,
    id: number,
    updateTemplateMessageDto: UpdateTemplateMessageDto,
  ) {
    return this.prismaService.templateMessage.update({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      data: updateTemplateMessageDto,
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
