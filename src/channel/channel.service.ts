import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { ApiChannelRepository } from 'src/shared/api-channel.repository';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly apiChannelRepository: ApiChannelRepository,
    private readonly webhookSenderService: WebhookSenderService,
  ) {}

  async create(projectId: number, data: CreateChannelDto) {
    return this.apiChannelRepository[data.type].create(
      projectId,
      data,
      this.prismaService,
      this.configService,
    );
  }

  async findAll(projectId: number) {
    return this.prismaService.channel.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });
  }

  async findOne(projectId: number, id: number) {
    return this.prismaService.channel.findUnique({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });
  }

  async update(
    projectId: number,
    id: number,
    updateChannelDto: UpdateChannelDto,
  ) {
    return this.prismaService.channel.update({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      data: updateChannelDto,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });
  }

  async delete(projectId: number, id: number) {
    return this.prismaService.channel.delete({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });
  }

  async handleEvent(channelId: number, event: any) {
    const channel = await this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    return this.apiChannelRepository[channel.type].handleEvent(
      channel,
      event,
      this.prismaService,
      this.webhookSenderService,
    );
  }
}
