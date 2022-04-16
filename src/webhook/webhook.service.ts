import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Injectable()
export class WebhookService {
  constructor(private readonly prismaService: PrismaService) {}

  create(projectId: number, createWebhookDto: CreateWebhookDto) {
    return this.prismaService.webhook.create({
      data: {
        projectId,
        ...createWebhookDto,
      },
      select: {
        id: true,
        name: true,
        url: true,
        eventType: true,
      },
    });
  }

  findAll(projectId: number) {
    return this.prismaService.webhook.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        name: true,
        url: true,
        eventType: true,
      },
    });
  }

  findOne(projectId: number, id: number) {
    return this.prismaService.webhook.findUnique({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      select: {
        id: true,
        name: true,
        url: true,
        eventType: true,
      },
    });
  }

  update(projectId: number, id: number, updateWebhookDto: UpdateWebhookDto) {
    return this.prismaService.webhook.update({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      data: updateWebhookDto,
      select: {
        id: true,
        name: true,
        url: true,
        eventType: true,
      },
    });
  }

  delete(projectId: number, id: number) {
    return this.prismaService.webhook.delete({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      select: {
        id: true,
        name: true,
        url: true,
        eventType: true,
      },
    });
  }
}
