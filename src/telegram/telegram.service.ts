import { Injectable } from '@nestjs/common';
import {
  AttachmentType,
  MessageStatus,
  WebhookEventType,
} from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/prisma.service';
import { WebhookSenderService } from 'src/shared/webhook-sender.service';
import { TelegramEventDto } from './dto/telegram-event.dto';

@Injectable()
export class TelegramService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly webhookSenderService: WebhookSenderService,
  ) {}

  async handleEvents(channelId: number, event: TelegramEventDto) {
    const messageFromTelegram = event.message ?? event.edited_message;

    if (!messageFromTelegram) {
      return;
    }

    const accountId = String(messageFromTelegram.chat.id);

    const channel = await this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
      select: {
        projectId: true,
        token: true,
      },
    });

    const bot = new TelegramBot(channel.token);

    const chat = await this.prismaService.chat.upsert({
      where: {
        channelId_accountId: {
          channelId,
          accountId,
        },
      },
      create: {
        accountId,
        contact: {
          create: await this.createContact(bot, messageFromTelegram),
        },
        channel: {
          connect: {
            id: channelId,
          },
        },
      },
      update: {
        isNew: false,
      },
      select: {
        id: true,
        isNew: true,
        contact: {
          select: {
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        messages: true,
      },
    });

    if (chat.isNew) {
      await this.webhookSenderService.dispatch(channel.projectId, {
        type: WebhookEventType.IncomingChats,
        payload: chat,
      });
    }

    const message = await this.prismaService.message.upsert({
      where: {
        externalId: String(messageFromTelegram.message_id),
      },
      create: {
        chatId: chat.id,
        fromMe: false,
        status: MessageStatus.Delivered,
        content: {
          create: {
            text: messageFromTelegram.text ?? messageFromTelegram.caption,
            attachments: {
              create: await this.createAttachment(bot, messageFromTelegram),
            },
            buttons: undefined,
          },
        },
        externalId: String(messageFromTelegram.message_id),
      },
      update: {
        updatedAt: new Date(),
        content: {
          create: {
            text: messageFromTelegram.text ?? messageFromTelegram.caption,
            attachments: {
              create: await this.createAttachment(bot, messageFromTelegram),
            },
            buttons: undefined,
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

    await this.webhookSenderService.dispatch(channel.projectId, {
      type: WebhookEventType.IncomingMessages,
      payload: [message],
    });

    return 'ok';
  }

  private async createContact(
    bot: TelegramBot,
    msg: TelegramEventDto['message'],
  ) {
    const user = await bot.getUserProfilePhotos(msg.from.id);
    const photo = user.photos[0]?.at(-1);

    let avatarUrl: string;
    if (photo) {
      avatarUrl = await bot.getFileLink(photo.file_id);
    }

    const name = [msg.from.first_name, msg.from.last_name]
      .filter(Boolean)
      .join(' ');

    return {
      username: msg.from.username,
      name,
      avatarUrl,
    };
  }

  private async createAttachment(
    bot: TelegramBot,
    msg: TelegramEventDto['message'],
  ) {
    if (msg.audio) {
      const url = await bot.getFileLink(msg.audio.file_id);
      return {
        type: AttachmentType.Audio,
        url,
        name: msg.audio.file_name,
      };
    }

    if (msg.document) {
      const url = await bot.getFileLink(msg.document.file_id);
      return {
        type: AttachmentType.Document,
        url,
        name: msg.document.file_name,
      };
    }

    if (msg.photo) {
      const photo = msg.photo.at(-1);

      const url = await bot.getFileLink(photo.file_id);
      return {
        type: AttachmentType.Image,
        url,
        name: null,
      };
    }

    if (msg.video) {
      const url = await bot.getFileLink(msg.video.file_id);
      return {
        type: AttachmentType.Video,
        url,
        name: msg.video.file_name,
      };
    }

    if (msg.voice) {
      const url = await bot.getFileLink(msg.voice.file_id);
      return {
        type: AttachmentType.Audio,
        url,
        name: null,
      };
    }
  }
}
