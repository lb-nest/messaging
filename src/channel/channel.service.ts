import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelService {
  constructor(private readonly prismaService: PrismaService) {}

  create(projectId: number, createChannelDto: CreateChannelDto) {
    return this.prismaService.channel.create({
      data: {
        projectId,
        ...createChannelDto,
      },
    });
  }

  findAll(projectId: number) {
    return this.prismaService.channel.findMany({
      where: {
        projectId,
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
    });
  }
}
