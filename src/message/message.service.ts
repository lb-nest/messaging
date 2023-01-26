import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import merge from 'deepmerge';
import { ChannelRepository } from 'src/channel/channel.repository';
import { PrismaService } from 'src/prisma.service';
import { BACKEND } from 'src/shared/constants/broker';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindAllMessagesDto } from './dto/find-all-messages.dto';
import { FindOneMessageDto } from './dto/find-one-message.dto';
import { RemoveMessageDto } from './dto/remove-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly prismaService: PrismaService,
    @Inject(BACKEND) private readonly client: ClientProxy,
  ) {}

  async create(
    projectId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message[]> {
    const { channel, ...chat } = await this.prismaService.chat.update({
      where: {
        projectId_channelId_accountId: {
          projectId,
          channelId: createMessageDto.channelId,
          accountId: createMessageDto.accountId,
        },
      },
      data: {
        updatedAt: new Date(),
      },
      include: {
        channel: true,
      },
    });

    const messages = await this.channelRepository
      .get(channel.type)
      .send(channel, chat, createMessageDto);

    this.client.emit('receiveChat', {
      projectId: channel.projectId,
      chat: merge(
        chat,
        {
          messages: messages.slice(-1),
        },
        {
          arrayMerge: (_, source) => source,
        },
      ),
    });

    messages.map((message) =>
      this.client.emit('receiveMessage', {
        projectId: channel.projectId,
        message,
      }),
    );

    return messages;
  }

  findAll(
    projectId: number,
    findAllMessagesDto: FindAllMessagesDto,
  ): Promise<Message[]> {
    return this.prismaService.message.findMany({
      where: {
        projectId,
        channelId: findAllMessagesDto.channelId,
        accountId: findAllMessagesDto.accountId,
      },
      orderBy: {
        id: 'desc',
      },
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
    });
  }

  findOne(
    projectId: number,
    findOneMessageDto: FindOneMessageDto,
  ): Promise<Message> {
    return this.prismaService.message.findUniqueOrThrow({
      where: {
        projectId_channelId_accountId_id: merge(findOneMessageDto, {
          projectId,
        }),
      },
      include: {
        chat: true,
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
    });
  }

  update(
    projectId: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    throw new NotImplementedException();
  }

  remove(
    projectId: number,
    removeMessageDto: RemoveMessageDto,
  ): Promise<Message> {
    throw new NotImplementedException();
  }
}
