import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { Webhook } from './entities/webhook.entity';

@Injectable()
export class WebhookService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    projectId: number,
    createWebhookDto: CreateWebhookDto,
  ): Promise<Webhook> {
    return this.prismaService.webhook.create({
      data: {
        projectId,
        ...createWebhookDto,
      },
    });
  }

  async findAll(projectId: number): Promise<Webhook[]> {
    return this.prismaService.webhook.findMany({
      where: {
        projectId,
      },
    });
  }

  async findOne(projectId: number, id: number): Promise<Webhook> {
    return this.prismaService.webhook.findUnique({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
    });
  }

  async update(
    projectId: number,
    id: number,
    updateWebhookDto: UpdateWebhookDto,
  ): Promise<Webhook> {
    return this.prismaService.webhook.update({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      data: updateWebhookDto,
    });
  }

  async delete(projectId: number, id: number): Promise<Webhook> {
    return this.prismaService.webhook.delete({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
    });
  }
}
