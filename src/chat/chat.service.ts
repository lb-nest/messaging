import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(projectId: number, createChatDto: CreateChatDto): Promise<Chat> {
    throw new NotImplementedException();
  }

  async findAll(projectId: number, ids?: number[]): Promise<Chat[]> {
    return this.prismaService.chat.findMany({
      where: {
        id: {
          in: ids,
        },
        channel: {
          projectId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        contact: true,
        messages: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
          include: {
            content: {
              orderBy: {
                id: 'desc',
              },
              take: 1,
              include: {
                attachments: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(projectId: number, id: number): Promise<Chat> {
    return this.prismaService.chat.findFirst({
      where: {
        id,
        channel: {
          projectId,
        },
      },
      include: {
        contact: true,
        messages: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
          include: {
            content: {
              orderBy: {
                id: 'desc',
              },
              take: 1,
              include: {
                attachments: true,
              },
            },
          },
        },
      },
    });
  }

  async update(
    projectId: number,
    id: number,
    updateChatDto: UpdateChatDto,
  ): Promise<Chat> {
    const chat = await this.prismaService.chat.findFirst({
      where: {
        id,
        channel: {
          projectId,
        },
      },
    });

    if (!chat) {
      throw new NotFoundException();
    }

    await this.prismaService.contact.update({
      where: {
        chatId: chat.id,
      },
      data: updateChatDto,
    });

    return this.findOne(projectId, id);
  }

  async delete(projectId: number, id: number): Promise<Chat> {
    const chat = await this.prismaService.chat.findFirst({
      where: {
        id,
        channel: {
          projectId,
        },
      },
    });

    if (!chat) {
      throw new NotFoundException();
    }

    return this.prismaService.chat.delete({
      where: {
        id: chat.id,
      },
      include: {
        contact: true,
        messages: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
          include: {
            content: {
              orderBy: {
                id: 'desc',
              },
              take: 1,
              include: {
                attachments: true,
              },
            },
          },
        },
      },
    });
  }
}
