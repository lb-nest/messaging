import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { ChannelType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(projectId: number, createChatDto: CreateChatDto) {
    const channel = await this.prismaService.channel.findUnique({
      where: {
        projectId_id: {
          projectId,
          id: createChatDto.channelId,
        },
      },
    });

    switch (channel.type) {
      case ChannelType.Telegram:
        throw new BadRequestException(
          'Telegram does not allow adding a contact directly',
        );

      default:
        break;
    }

    throw new NotImplementedException();
  }

  async findAll(projectId: number, ids?: number[]) {
    return this.prismaService.chat.findMany({
      where: {
        id: {
          in: ids,
        },
        channel: {
          projectId,
        },
      },
      select: {
        id: true,
        contact: {
          select: {
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
          select: {
            id: true,
            fromMe: true,
            status: true,
            content: {
              orderBy: {
                id: 'desc',
              },
              take: 1,
              select: {
                text: true,
                attachments: {
                  select: {
                    type: true,
                    url: true,
                    name: true,
                  },
                },
                buttons: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findOne(projectId: number, id: number) {
    return this.prismaService.chat.findFirst({
      where: {
        id,
        channel: {
          projectId,
        },
      },
      select: {
        id: true,
        contact: {
          select: {
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
          select: {
            id: true,
            fromMe: true,
            status: true,
            content: {
              orderBy: {
                id: 'desc',
              },
              take: 1,
              select: {
                text: true,
                attachments: {
                  select: {
                    type: true,
                    url: true,
                    name: true,
                  },
                },
                buttons: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async update(projectId: number, id: number, updateChatDto: UpdateChatDto) {
    await this.prismaService.contact.updateMany({
      where: {
        chat: {
          id,
          channel: {
            projectId,
          },
        },
      },
      data: updateChatDto,
    });

    return this.findOne(projectId, id);
  }

  async delete(projectId: number, id: number) {
    return this.prismaService.chat.deleteMany({
      where: {
        id,
        channel: {
          projectId,
        },
      },
    });
  }
}
