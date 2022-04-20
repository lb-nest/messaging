import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ChannelContext } from './channel.context';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { TelegramStrategy } from './telegram.strategy';
import { WebchatStrategy } from './webchat.strategy';
import { WhatsappStrategy } from './whatsapp.strategy';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly context: ChannelContext,
  ) {}

  async create(projectId: number, createChannelDto: CreateChannelDto) {
    switch (createChannelDto.type) {
      case ChannelType.Telegram:
        this.context.setStrategy(
          new TelegramStrategy(this.prismaService, this.configService),
        );
        break;

      case ChannelType.Webchat:
        this.context.setStrategy(
          new WebchatStrategy(this.prismaService, this.configService),
        );
        break;

      case ChannelType.Whatsapp:
        this.context.setStrategy(
          new WhatsappStrategy(this.prismaService, this.configService),
        );
        break;

      default:
        throw new NotImplementedException();
    }

    return this.context.create(projectId, createChannelDto);
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
