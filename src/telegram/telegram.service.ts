import { Injectable } from '@nestjs/common';
import { AttachmentType, MessageStatus } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/prisma.service';
import { TelegramEventDto } from './dto/telegram-event.dto';

@Injectable()
export class TelegramService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleWebhook(channelId: number, event: TelegramEventDto) {
    const message = event.message ?? event.edited_message;

    const accountId = String(message.chat.id);

    const channel = await this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
      select: {
        token: true,
      },
    });

    const bot = new TelegramBot(channel.token);

    const chat = await this.prismaService.chat.upsert({
      where: {
        accountId,
      },
      create: {
        accountId,
        contact: {
          create: await this.createContact(bot, message),
        },
        channel: {
          connect: {
            id: channelId,
          },
        },
      },
      update: {},
    });

    const createdMessage = await this.prismaService.message.upsert({
      where: {
        externalId: String(message.message_id),
      },
      create: {
        chatId: chat.id,
        externalId: String(message.message_id),
        fromMe: false,
        status: MessageStatus.Delivered,
        content: {
          create: {
            buttons: undefined,
            text: message.text ?? message.caption,
            attachments: {
              create: await this.createAttachment(bot, message),
            },
          },
        },
      },
      update: {
        content: {
          create: {
            buttons: undefined,
            text: message.text ?? message.caption,
            attachments: {
              create: await this.createAttachment(bot, message),
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
    bot: TelegramBot,
    message: TelegramEventDto['message'],
  ) {
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

  private async createContact(
    bot: TelegramBot,
    message: TelegramEventDto['message'],
  ) {
    const user = await bot.getUserProfilePhotos(message.from.id);
    const photo = user.photos[0]?.at(-1);

    let avatarUrl: string;
    if (photo) {
      avatarUrl = await bot.getFileLink(photo.file_id);
    }

    const name = [message.from.first_name, message.from.last_name]
      .filter(Boolean)
      .join(' ');

    return {
      username: message.from.username,
      name,
      avatarUrl,
    };
  }
}
