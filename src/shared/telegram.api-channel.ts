import { ConfigService } from '@nestjs/config';
import * as Prisma from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiChannel } from './api-channel.interface';
import { WebhookSenderService } from './webhook-sender.service';

export class TelegramApiChannel extends ApiChannel {
  private readonly bot: TelegramBot;

  constructor(
    channel: Prisma.Channel,
    prismaService: PrismaService,
    configService: ConfigService,
  ) {
    super(channel, prismaService, configService);
    this.bot = new TelegramBot(channel.token);
  }

  static async create(
    projectId: number,
    data: CreateChannelDto,
    prisma: PrismaService,
    config: ConfigService,
  ): Promise<Channel> {
    const bot = new TelegramBot(data.token);
    await bot.getMe();

    const channel = await prisma.channel.create({
      data: {
        projectId,
        ...data,
        status: Prisma.ChannelStatus.Connected,
      },
    });

    const url = config.get<string>('MESSAGING_URL');
    await bot.setWebHook(url.concat(`/channels/${channel.id}/webhook`));

    return channel;
  }

  static async handleEvent(
    channel: Prisma.Channel,
    event: TelegramBot.Update,
    prisma: PrismaService,
    webhookSender: WebhookSenderService,
  ): Promise<'ok'> {
    const messageFromTelegram = event.message ?? event.edited_message;
    if (!messageFromTelegram) {
      return;
    }

    const accountId = String(messageFromTelegram.chat.id);
    const bot = new TelegramBot(channel.token);

    const chat = await prisma.chat.upsert({
      where: {
        channelId_accountId: {
          channelId: channel.id,
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
            id: channel.id,
          },
        },
      },
      update: {
        isNew: false,
      },
      include: {
        contact: true,
      },
    });

    const message = await prisma.message.upsert({
      where: {
        chatId_externalId: {
          chatId: chat.id,
          externalId: String(messageFromTelegram.message_id),
        },
      },
      create: {
        chatId: chat.id,
        fromMe: false,
        status: Prisma.MessageStatus.Delivered,
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
        content: {
          create: {
            text: messageFromTelegram.text ?? messageFromTelegram.caption,
            attachments: {
              create: await this.createAttachment(bot, messageFromTelegram),
            },
            buttons: undefined,
          },
        },
        updatedAt: new Date(),
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

    await webhookSender.dispatchAsync(channel.projectId, {
      type: Prisma.WebhookEventType.IncomingChats,
      payload: {
        ...chat,
        messages: [message],
      },
    });

    await webhookSender.dispatchAsync(channel.projectId, {
      type: Prisma.WebhookEventType.IncomingMessages,
      payload: [message],
    });

    return 'ok';
  }

  async send(chat: Prisma.Chat, message: CreateMessageDto): Promise<any[]> {
    const messages: TelegramBot.Message[] = [];

    if (message.text) {
      messages.push(
        await this.bot.sendMessage(chat.accountId, message.text, {
          reply_markup: undefined,
        }),
      );
    }

    if (message.attachments.length > 0) {
      const attachments = await Promise.all(
        message.attachments.map((attachment) => {
          switch (attachment.type) {
            case Prisma.AttachmentType.Audio:
              return this.bot.sendAudio(chat.accountId, attachment.url);

            case Prisma.AttachmentType.Document:
            case Prisma.AttachmentType.Video:
              return this.bot.sendDocument(chat.accountId, attachment.url, {
                caption: attachment.name,
              });

            case Prisma.AttachmentType.Image:
              return this.bot.sendPhoto(chat.accountId, attachment.url, {
                caption: attachment.name,
              });
          }
        }),
      );

      messages.push(...attachments);
    }

    return Promise.all(
      messages.map(async (message) =>
        this.prismaService.message.create({
          data: {
            chatId: chat.id,
            externalId: String(message.message_id),
            fromMe: true,
            status: Prisma.MessageStatus.Delivered,
            content: {
              create: {
                text: message.text ?? message.caption,
                attachments: {
                  create: await TelegramApiChannel.createAttachment(
                    this.bot,
                    message,
                  ),
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
        }),
      ),
    );
  }

  private static async createContact(
    bot: TelegramBot,
    msg: TelegramBot.Message,
  ): Promise<Omit<Prisma.Contact, 'chatId'>> {
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

  private static async createAttachment(
    bot: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<Omit<Prisma.Attachment, 'id' | 'contentId'>> {
    if (message.audio) {
      const url = await bot.getFileLink(message.audio.file_id);
      return {
        type: Prisma.AttachmentType.Audio,
        url,
        name: message.audio.title,
      };
    }

    if (message.document) {
      const url = await bot.getFileLink(message.document.file_id);
      return {
        type: Prisma.AttachmentType.Document,
        url,
        name: message.document.file_name,
      };
    }

    if (message.photo) {
      const photo = message.photo.at(-1);

      const url = await bot.getFileLink(photo.file_id);
      return {
        type: Prisma.AttachmentType.Image,
        url,
        name: null,
      };
    }

    if (message.video) {
      const url = await bot.getFileLink(message.video.file_id);
      return {
        type: Prisma.AttachmentType.Video,
        url,
        name: null,
      };
    }

    if (message.voice) {
      const url = await bot.getFileLink(message.voice.file_id);
      return {
        type: Prisma.AttachmentType.Audio,
        url,
        name: null,
      };
    }
  }
}
