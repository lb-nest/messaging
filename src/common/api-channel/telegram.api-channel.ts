import { AttachmentType, Channel, Chat } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { BaseApiChannel } from './base.api-channel';
import { IMessage } from './interfaces/message.interface';

export class TelegramApiChannel extends BaseApiChannel {
  private readonly bot: TelegramBot;

  constructor(channel: Channel) {
    super(channel);
    this.bot = new TelegramBot(channel.token);
  }

  async sendMessage(chat: Chat, message: IMessage): Promise<string[]> {
    const ids = [];

    if (message.text) {
      const result = await this.bot.sendMessage(chat.accountId, message.text);
      ids.push(String(result.message_id));
    }

    if (message.attachments.length > 0) {
      const result = await Promise.all(
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

      ids.push(...result.map((item) => String(item.message_id)));
    }

    return ids;
  }
}
