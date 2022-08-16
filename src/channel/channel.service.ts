import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ChannelRepository } from './channel.repository';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Injectable()
export class ChannelService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly prismaService: PrismaService,
  ) {}

  create(
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    return this.channelRepository
      .get(createChannelDto.type)
      .create(projectId, createChannelDto);
  }

  findAll(projectId: number): Promise<Channel[]> {
    return this.prismaService.channel.findMany({
      where: {
        projectId,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  findOne(projectId: number, id: number): Promise<Channel> {
    return this.prismaService.channel.findUniqueOrThrow({
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
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.prismaService.channel.update({
      where: {
        projectId_id: {
          projectId,
          id: updateChannelDto.id,
        },
      },
      data: updateChannelDto,
    });
  }

  remove(projectId: number, id: number): Promise<Channel> {
    return this.prismaService.channel.delete({
      where: {
        projectId_id: {
          projectId,
          id,
        },
      },
    });
  }

  async handle(id: number, event: any): Promise<unknown> {
    const channel = await this.prismaService.channel.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return this.channelRepository.get(channel.type).handle(channel, event);
  }
}
