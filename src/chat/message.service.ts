import { Injectable } from '@nestjs/common';
import { ApiChannelFactory } from 'src/common/api-channel.factory';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly apiChannelFactory: ApiChannelFactory,
  ) {}

  async create(chatId: number, createMessageDto: CreateMessageDto) {
    const chat = await this.prismaService.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        channel: true,
      },
    });

    const ids = await this.apiChannelFactory
      .create(chat.channel)
      .sendMessage(chat, createMessageDto);

    console.log(ids);
    return;

    return this.prismaService.message.create({
      data: {
        externalId: '',
        fromMe: true,
        status: 'Delivered',
        chat: {
          connect: {
            id: chatId,
          },
        },
        content: {
          create: {
            text: createMessageDto.text,
            attachments: {
              createMany: {
                data: createMessageDto.attachments,
              },
            },
            buttons: createMessageDto.buttons,
          },
        },
      },
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
    });
  }

  findAll() {
    return '';
  }

  update(id: number, updateMessageDto: any) {
    return '';
  }

  delete(id: number) {
    return '';
  }
}
