import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { ChannelType, Prisma } from '@prisma/client';
import { ChannelService } from 'src/channel/channel.service';
import { PrismaService } from 'src/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ImportChatsDto } from './dto/import-chats.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly channelService: ChannelService,
  ) {}

  async create(projectId: number, createChatDto: CreateChatDto): Promise<Chat> {
    throw new NotImplementedException();
  }

  async findAll(
    projectId: number,
    ids?: number[],
    orderBy?: Prisma.SortOrder,
  ): Promise<Chat[]> {
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
        id: orderBy,
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
    const chat = await this.prismaService.chat.findFirst({
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

    if (!chat) {
      throw new NotFoundException();
    }

    return chat;
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

  async import(
    projectId: number,
    importChatsDto: ImportChatsDto,
  ): Promise<Chat[]> {
    const channel = await this.channelService.findOne(
      projectId,
      importChatsDto.channelId,
    );

    if (channel.type !== ChannelType.Whatsapp) {
      throw new BadRequestException(
        'Importing contacts is allowed only for Whatsapp channels',
      );
    }

    return this.prismaService.$transaction(
      importChatsDto.chats.map(({ accountId, ...contact }) =>
        this.prismaService.chat.create({
          data: {
            channel: {
              connect: {
                projectId_id: {
                  projectId,
                  id: importChatsDto.channelId,
                },
              },
            },
            accountId,
            contact: {
              create: contact,
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
        }),
      ),
    );
  }
}
