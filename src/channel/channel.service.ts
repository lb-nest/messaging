import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { ApiChannelRepository } from 'src/shared/api-channel.repository';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly apiChannelRepository: ApiChannelRepository,
    private readonly webhookSenderService: WebhookSenderService,
  ) {}

  async create(projectId: number, data: CreateChannelDto): Promise<Channel> {
    return this.apiChannelRepository[data.type].create(
      projectId,
      data,
      this.prismaService,
      this.configService,
    );
  }

  async findAll(projectId: number): Promise<Channel[]> {
    return this.prismaService.channel.findMany({
      where: {
        projectId,
      },
    });
  }

  async findOne(projectId: number, id: number): Promise<Channel> {
    return this.prismaService.channel.findUnique({
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
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.prismaService.channel.update({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
      data: updateChannelDto,
    });
  }

  async delete(projectId: number, id: number): Promise<Channel> {
    return this.prismaService.channel.delete({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
    });
  }

  async handleEvent(channelId: number, event: any): Promise<'ok'> {
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
