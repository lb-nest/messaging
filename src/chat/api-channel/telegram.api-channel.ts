import { AttachmentType, Channel, Chat, MessageStatus } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { BaseApiChannel } from './base.api-channel';

export class TelegramApiChannel extends BaseApiChannel {
  private readonly bot: TelegramBot;

  constructor(channel: Channel, prismaService: PrismaService) {
    super(channel, prismaService);
    this.bot = new TelegramBot(channel.token);
  }

  async sendMessage(chat: Chat, message: CreateMessageDto): Promise<any[]> {
    const telegramMessages = [];

    if (message.text) {
      telegramMessages.push(
        await this.bot.sendMessage(chat.accountId, message.text, {
          reply_markup: undefined,
        }),
      );
    }

    if (message.attachments.length > 0) {
      const attachments = await Promise.all(
        message.attachments.map((attachment) => {
          switch (attachment.type) {
            case AttachmentType.Audio:
              return this.bot.sendAudio(chat.accountId, attachment.url);

            case AttachmentType.Document:
            case AttachmentType.Video:
              return this.bot.sendDocument(chat.accountId, attachment.url, {
                caption: attachment.name,
              });

            case AttachmentType.Image:
              return this.bot.sendPhoto(chat.accountId, attachment.url, {
                caption: attachment.name,
              });
          }
        }),
      );

      telegramMessages.push(...attachments);
    }

    return Promise.all(
      telegramMessages.map(async (message) =>
        this.prismaService.message.create({
          data: {
            chatId: chat.id,
            externalId: String(message.message_id),
            fromMe: true,
            status: MessageStatus.Delivered,
            content: {
              create: {
                buttons: undefined,
                text: message.text ?? message.caption,
                attachments: {
                  create: await TelegramApiChannel.createAttachment(
                    this.bot,
                    message,
                  ),
                },
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
        }),
      ),
    );
  }

  public static async createAttachment(bot: TelegramBot, message: any) {
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
