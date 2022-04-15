import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { MessageService } from './message.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly messageService: MessageService,
  ) {}

  create(projectId: number, createChatDto: CreateChatDto) {
    throw new NotImplementedException();
  }

  findAll(projectId: number) {
    return this.prismaService.chat.findMany({
      where: {
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

  findOne(projectId: number, id: number) {
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

  update(projectId: number, id: number, updateChatDto: UpdateChatDto) {
    throw new NotImplementedException();
  }

  delete(projectId: number, id: number) {
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
