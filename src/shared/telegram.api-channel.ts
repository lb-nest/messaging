import { BadRequestException } from '@nestjs/common';
import * as Prisma from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { MessageWithChatId } from 'src/chat/entities/message-with-chat-id.entity';
import { ApiChannel } from './api-channel.interface';
import { WebhookSenderService } from './webhook-sender.service';

export class TelegramApiChannel extends ApiChannel<TelegramBot.Update> {
  private readonly SEND_METHODS = {
    [Prisma.AttachmentType.Audio]: 'sendAudio',
    [Prisma.AttachmentType.Document]: 'sendDocument',
    [Prisma.AttachmentType.Image]: 'sendPhoto',
    [Prisma.AttachmentType.Video]: 'sendVideo',
  };

  async create(
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    try {
      const bot = new TelegramBot(createChannelDto.token);
      await bot.getMe();

      const channel = await this.prismaService.channel.create({
        data: {
          projectId,
          ...createChannelDto,
          status: Prisma.ChannelStatus.Connected,
        },
      });

      await bot.setWebHook(
        this.configService
          .get<string>('MESSAGING_URL')
          .concat(`/channels/${channel.id}/webhook`),
      );

      return channel;
    } catch {
      throw new BadRequestException();
    }
  }

  async send(
    channel: Prisma.Channel,
    chat: Prisma.Chat,
    message: CreateMessageDto,
  ): Promise<MessageWithChatId[]> {
    const messages: TelegramBot.Message[] = [];
    const bot = new TelegramBot(channel.token);

    if (message.text) {
      messages.push(
        await bot.sendMessage(chat.accountId, message.text, {
          reply_markup: {
            one_time_keyboard: true,
            force_reply: true,
            resize_keyboard: true,
            keyboard: message.buttons?.map((button) => [
              {
                text: button.text,
              },
            ]),
          },
        }),
      );
    }

    messages.push(
      ...(await Promise.all(
        message.attachments.map((attachment) =>
          bot[this.SEND_METHODS[attachment.type]](
            chat.accountId,
            attachment.url,
            {
              caption: attachment.name,
            },
          ),
        ),
      )),
    );

    return Promise.all(
      messages.map(async (message) =>
        this.createMessage(
          chat.id,
          Prisma.MessageStatus.Delivered,
          {
            create: {
              text: message.text,
              attachments: {
                create: await this.createAttachment(bot, message),
              },
              buttons: undefined,
            },
          },
          message.message_id.toString(),
          true,
        ),
      ),
    );
  }

  async handle(
    channel: Prisma.Channel,
    event: TelegramBot.Update,
    webhookSenderService: WebhookSenderService,
  ): Promise<'ok'> {
    const telegramMessage = event.message ?? event.edited_message;
    if (!telegramMessage) {
      return;
    }

    const bot = new TelegramBot(channel.token);

    const chat = await this.createChat(
      channel.id,
      String(telegramMessage.chat.id),
      {
        create: await this.createContact(bot, telegramMessage.chat.id),
      },
    );

    const message = await this.createMessage(
      chat.id,
      Prisma.MessageStatus.Delivered,
      {
        create: {
          text: telegramMessage.text ?? telegramMessage.caption,
          attachments: {
            create: await this.createAttachment(bot, telegramMessage),
          },
          buttons: undefined,
        },
      },
      String(telegramMessage.message_id.toString()),
    );

    await webhookSenderService.dispatchAsync(channel.projectId, {
      type: Prisma.WebhookEventType.IncomingChats,
      payload: {
        ...chat,
        messages: [message],
      },
    });

    await webhookSenderService.dispatchAsync(channel.projectId, {
      type: Prisma.WebhookEventType.IncomingMessages,
      payload: [message],
    });

    return 'ok';
  }

  private async createContact(
    bot: TelegramBot,
    chatId: TelegramBot.ChatId,
  ): Promise<Omit<Prisma.Contact, 'chatId'>> {
    const chat = await bot.getChat(chatId);

    let avatarUrl: string;
    if (chat.photo) {
      avatarUrl = await this.s3Service.upload(
        bot.getFileStream(chat.photo.big_file_id),
      );
    }

    const name = [chat.first_name, chat.last_name].filter(Boolean).join(' ');
    return {
      username: chat.username,
      name,
      avatarUrl,
    };
  }

  private async createAttachment(
    bot: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<Prisma.Prisma.AttachmentCreateWithoutContentInput> {
    if (message.audio) {
      return {
        type: Prisma.AttachmentType.Audio,
        url: await this.s3Service.upload(
          bot.getFileStream(message.audio.file_id),
          message.audio.title,
          message.audio.mime_type,
        ),
        name: message.audio.title,
      };
    }

    if (message.document) {
      return {
        type: Prisma.AttachmentType.Document,
        url: await this.s3Service.upload(
          bot.getFileStream(message.document.file_id),
          message.document.file_name,
          message.document.mime_type,
        ),
        name: message.document.file_name,
      };
    }

    if (message.photo) {
      return {
        type: Prisma.AttachmentType.Image,
        url: await this.s3Service.upload(
          bot.getFileStream(message.photo.at(-1).file_id),
        ),
        name: null,
      };
    }

    if (message.video) {
      return {
        type: Prisma.AttachmentType.Video,
        url: await this.s3Service.upload(
          bot.getFileStream(message.video.file_id),
          undefined,
          message.video.mime_type,
        ),
        name: null,
      };
    }

    if (message.voice) {
      return {
        type: Prisma.AttachmentType.Audio,
        url: await this.s3Service.upload(
          bot.getFileStream(message.voice.file_id),
          undefined,
          message.voice.mime_type,
        ),
        name: null,
      };
    }
  }
}
