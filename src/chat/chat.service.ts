import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { FindAllChatsDto } from './dto/find-all-chats.dto';
import { FindOneChatDto } from './dto/find-one-chat.dto';
import { RemoveChatDto } from './dto/remove-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(projectId: number, createChatDto: CreateChatDto): Promise<Chat> {
    return this.prismaService.chat.upsert({
      where: {
        projectId_channelId_accountId: {
          projectId,
          channelId: createChatDto.channelId,
          accountId: createChatDto.accountId,
        },
      },
      create: {
        projectId,
        channel: {
          connect: {
            projectId_id: {
              projectId,
              id: createChatDto.channelId,
            },
          },
        },
        accountId: createChatDto.accountId,
      },
      update: {},
      include: {
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
  ): Prisma.PrismaPromise<Chat[]> {
    return this.prismaService.chat.findMany({
      where: {
        projectId,
        accountId: {
          in: findAllChatsDto.accountIds,
        },
      },
      include: {
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

  findOne(
    projectId: number,
    findOneChatDto: FindOneChatDto,
  ): Prisma.PrismaPromise<Chat> {
    return this.prismaService.chat.findUniqueOrThrow({
      where: {
        projectId_channelId_accountId: {
          projectId,
          channelId: findOneChatDto.channelId,
          accountId: findOneChatDto.accountId,
        },
      },
      include: {
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

  async update(projectId: number, updateChatDto: UpdateChatDto): Promise<Chat> {
    return this.prismaService.chat.update({
      where: {
        projectId_channelId_accountId: {
          projectId,
          channelId: updateChatDto.channelId,
          accountId: updateChatDto.accountId,
        },
      },
      data: updateChatDto,
      include: {
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

  async remove(projectId: number, removeChatDto: RemoveChatDto): Promise<Chat> {
    return this.prismaService.chat.delete({
      where: {
        projectId_channelId_accountId: {
          projectId,
          channelId: removeChatDto.channelId,
          accountId: removeChatDto.accountId,
        },
      },
      include: {
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
