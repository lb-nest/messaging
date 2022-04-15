import { Injectable } from '@nestjs/common';
import { AttachmentType, MessageStatus } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/prisma.service';
import { TelegramEventDto } from './dto/telegram-event.dto';

@Injectable()
export class TelegramService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleWebhook(channelId: number, event: TelegramEventDto) {
    const accountId = String(event.message.chat.id);

    const chat = await this.prismaService.chat.upsert({
      where: {
        accountId,
      },
      create: {
        accountId,
        contactId: -1,
        channelId,
      },
      update: {},
    });

    const message = await this.prismaService.message.create({
      data: {
        chatId: chat.id,
        externalIds: [event.message.message_id],
        fromMe: false,
        status: MessageStatus.Delivered,
        content: {
          create: {
            buttons: undefined,
            text: event.message.text ?? event.message.caption,
            attachments: {
              create: await this.createAttachment(channelId, event.message),
            },
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

    // TODO: notify message received

    return 'ok';
  }

  private async createAttachment(
    channelId: number,
    message: TelegramEventDto['message'],
  ) {
    const channel = await this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
      select: {
        token: true,
      },
    });

    const bot = new TelegramBot(channel.token);

    if (message.audio) {
      const url = await bot.getFileLink(message.audio.file_id);
      return {
        type: AttachmentType.Audio,
        url,
        name: message.audio.file_name,
      };
    }

    if (message.document) {
      const url = await bot.getFileLink(message.document.file_id);
      return {
        type: AttachmentType.Document,
        url,
        name: message.document.file_name,
      };
    }

    if (message.photo) {
      const photo = message.photo.at(-1);

      const url = await bot.getFileLink(photo.file_id);
      return {
        type: AttachmentType.Image,
        url,
        name: null,
      };
    }

    if (message.video) {
      const url = await bot.getFileLink(message.video.file_id);
      return {
        type: AttachmentType.Video,
        url,
        name: message.video.file_name,
      };
    }

    if (message.voice) {
      const url = await bot.getFileLink(message.voice.file_id);
      return {
        type: AttachmentType.Audio,
        url,
        name: null,
      };
    }
  }
}
