import Prisma from '@prisma/client';
import merge from 'deepmerge';
import TelegramBot from 'node-telegram-bot-api';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { Message } from 'src/message/entities/message.entity';
import { AbstractChannel } from './abstract.channel';

export class TelegramChannel extends AbstractChannel<TelegramBot.Update> {
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
  }

  async send(
    channel: Prisma.Channel,
    chat: Prisma.Chat,
    message: CreateMessageDto,
  ): Promise<Message[]> {
    const messages: TelegramBot.Message[] = [];
    const bot = new TelegramBot(channel.token as string);

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
          chat,
          message.message_id.toString(),
          {
            create: {
              text: message.text,
              attachments: {
                create: await this.createAttachment(bot, message),
              },
              buttons: undefined,
            },
          },
          Prisma.MessageStatus.Delivered,
          true,
        ),
      ),
    );
  }

  async handle(
    channel: Prisma.Channel,
    event: TelegramBot.Update,
  ): Promise<'ok'> {
    const telegramMessage = event.message ?? event.edited_message;
    if (!telegramMessage) {
      return;
    }

    const bot = new TelegramBot(channel.token as string);

    const chat = await this.createChat(
      channel.projectId,
      channel.id,
      telegramMessage.chat.id.toString(),
    );

    const message = await this.createMessage(
      chat,
      telegramMessage.message_id.toString(),
      {
        create: {
          text: telegramMessage.text ?? telegramMessage.caption,
          attachments: {
            create: await this.createAttachment(bot, telegramMessage),
          },
          buttons: undefined,
        },
      },
      Prisma.MessageStatus.Delivered,
    );

    this.client.emit('receiveChat', {
      projectId: channel.projectId,
      chat: merge(
        chat,
        {
          contact: {
            name: 'N/A',
          },
          messages: [message],
        },
        {
          arrayMerge: (_, source) => source,
        },
      ),
    });

    this.client.emit('receiveMessage', {
      projectId: channel.projectId,
      message,
    });

    return 'ok';
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
