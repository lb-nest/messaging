import { Injectable, NotImplementedException } from '@nestjs/common';
import { ChannelType, WebhookEventType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { TelegramStrategy } from './telegram.strategy';
import { WebchatStrategy } from './webchat.strategy';
import { WhatsappStrategy } from './whatsapp.strategy';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly webhookSenderService: WebhookSenderService,
  ) {}

  async create(
    projectId: number,
    chatId: number,
    createMessageDto: CreateMessageDto,
  ) {
    const chat = await this.prismaService.chat.findFirst({
      where: {
        id: chatId,
        channel: {
          projectId,
        },
      },
      include: {
        channel: true,
      },
    });

    const channels = {
      [ChannelType.Telegram]: TelegramStrategy,
      [ChannelType.Webchat]: WebchatStrategy,
      [ChannelType.Whatsapp]: WhatsappStrategy,
    };

    const channel = new channels[chat.channel.type](
      chat.channel,
      this.prismaService,
    );

    const messages = await channel.send(chat, createMessageDto);

    this.webhookSenderService.dispatch(projectId, {
      type: WebhookEventType.OutgoingMessages,
      payload: messages,
    });

    return messages;
  }

  findAll(projectId: number, chatId: number) {
    return this.prismaService.message.findMany({
      where: {
        chat: {
          id: chatId,
          channel: {
            projectId,
          },
        },
      },
      select: {
        id: true,
        fromMe: true,
        status: true,
        chat: {
          select: {
            id: true,
          },
        },
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

  async update(
    projectId: number,
    id: number,
    updateMessageDto: UpdateMessageDto,
  ) {
    throw new NotImplementedException();
  }

  async delete(projectId: number, id: number) {
    throw new NotImplementedException();
  }
}
