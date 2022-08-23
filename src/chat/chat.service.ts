import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { FindAllChatsDto } from './dto/find-all-chats.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  create(projectId: number, createChatDto: CreateChatDto): Promise<Chat> {
    return this.prismaService.chat.create({
      data: {
        channel: {
          connect: {
            projectId_id: {
              projectId,
              id: createChatDto.channelId,
            },
          },
        },
        accountId: createChatDto.accountId,
        contact: {
          create: {
            name: createChatDto.name,
            avatarUrl: createChatDto.avatarUrl,
          },
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

  findAll(
    projectId: number,
    findAllChatsDto: FindAllChatsDto,
  ): Promise<Chat[]> {
    return this.prismaService.chat.findMany({
      where: {
        id: {
          in: findAllChatsDto.ids,
        },
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

  findOne(projectId: number, id: number): Promise<Chat> {
    return this.prismaService.chat.findFirstOrThrow({
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
    { id, accountId, ...updateChatDto }: UpdateChatDto,
  ): Promise<Chat> {
    const chat = await this.findOne(projectId, id);

    return this.prismaService.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        accountId,
        contact: {
          update: updateChatDto,
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

  async remove(projectId: number, id: number): Promise<Chat> {
    const chat = await this.prismaService.chat.findFirstOrThrow({
      where: {
        id,
        channel: {
          projectId,
        },
      },
      select: {
        id: true,
      },
    });

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
