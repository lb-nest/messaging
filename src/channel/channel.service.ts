import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { ApiChannelRepository } from 'src/shared/api-channel.repository';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly apiChannelRepository: ApiChannelRepository,
  ) {}

  async create(projectId: number, createChannelDto: CreateChannelDto) {
    return this.apiChannelRepository[createChannelDto.type].create(
      this.prismaService,
      this.configService,
      projectId,
      createChannelDto,
    );
  }

  findAll(projectId: number) {
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

  findOne(projectId: number, id: number) {
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

  update(projectId: number, id: number, updateChannelDto: UpdateChannelDto) {
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

  delete(projectId: number, id: number) {
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
}
