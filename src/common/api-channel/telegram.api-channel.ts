import { AttachmentType, Channel, Chat } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { BaseApiChannel } from './base.api-channel';
import { IMessage } from '../interfaces/message.interface';

export class TelegramApiChannel extends BaseApiChannel {
  private readonly bot: TelegramBot;

  constructor(channel: Channel) {
    super(channel);
    this.bot = new TelegramBot(channel.token);
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

  async sendMessage<T>(chat: Chat, message: IMessage): Promise<T[]> {
    const result = [];

    if (message.text) {
      result.push(
        await this.bot.sendMessage(chat.accountId, message.text, {
          reply_markup: undefined,
        }),
      );
    }

    if (message.attachments.length > 0) {
      const messages = await Promise.all(
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

      result.push(...messages);
    }

    return result;
  }
}
