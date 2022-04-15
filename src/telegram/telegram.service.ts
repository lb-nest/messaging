import { Injectable } from '@nestjs/common';
import { MessageStatus } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { TelegramApiChannel } from 'src/common/api-channel/telegram.api-channel';
import { PrismaService } from 'src/prisma.service';
import { TelegramEventDto } from './dto/telegram-event.dto';

@Injectable()
export class TelegramService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleWebhook(channelId: number, event: TelegramEventDto) {
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
    });

    if (chat.isNew) {
      // TODO: notify webhook receiver
    }

    const message = await this.prismaService.message.upsert({
      where: {
        externalId: String(messageFromTelegram.message_id),
      },
      create: {
        chatId: chat.id,
        externalId: String(messageFromTelegram.message_id),
        fromMe: false,
        status: MessageStatus.Delivered,
        content: {
          create: {
            buttons: undefined,
            text: messageFromTelegram.text ?? messageFromTelegram.caption,
            attachments: {
              create: await TelegramApiChannel.createAttachment(
                bot,
                messageFromTelegram,
              ),
            },
          },
        },
      },
      update: {
        content: {
          create: {
            buttons: undefined,
            text: messageFromTelegram.text ?? messageFromTelegram.caption,
            attachments: {
              create: await TelegramApiChannel.createAttachment(
                bot,
                messageFromTelegram,
              ),
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

    // TODO: notify webhook receiver

    return 'ok';
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
