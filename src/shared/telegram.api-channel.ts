import { ConfigService } from '@nestjs/config';
import {
  AttachmentType,
  Channel,
  ChannelStatus,
  Chat,
  MessageStatus,
  WebhookEventType,
} from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { TelegramEventDto } from 'src/channel/dto/telegram-event.dto';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiChannel } from './api-channel.interface';
import { WebhookSenderService } from './webhook-sender.service';

export class TelegramApiChannel extends ApiChannel {
  private readonly bot: TelegramBot;

  constructor(channel: Channel, prismaService: PrismaService) {
    super(channel, prismaService);
    this.bot = new TelegramBot(channel.token);
  }

  static async create(
    projectId: number,
    data: CreateChannelDto,
    prisma: PrismaService,
    config: ConfigService,
  ): Promise<any> {
    const bot = new TelegramBot(data.token);
    await bot.getMe();

    const channel = await prisma.channel.create({
      data: {
        projectId,
        ...data,
        status: ChannelStatus.Connected,
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });

    const url = config.get<string>('MESSAGING_URL');
    await bot.setWebHook(url.concat(`/channels/${channel.id}/webhook`));

    return channel;
  }

  static async handleEvent(
    channel: Channel,
    event: TelegramEventDto,
    prisma: PrismaService,
    webhookSender: WebhookSenderService,
  ) {
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
          create: await TelegramApiChannel.createContact(
            bot,
            messageFromTelegram,
          ),
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
      await webhookSender.dispatch(channel.projectId, {
        type: WebhookEventType.IncomingChats,
        payload: chat,
      });
    }

    const message = await prisma.message.upsert({
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
              create: await TelegramApiChannel.createAttachment(
                bot,
                messageFromTelegram,
              ),
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
              create: await TelegramApiChannel.createAttachment(
                bot,
                messageFromTelegram,
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
    });

    await webhookSender.dispatch(channel.projectId, {
      type: WebhookEventType.IncomingMessages,
      payload: [message],
    });

    return 'ok';
  }

  static async createContact(
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

  static async createAttachment(bot: TelegramBot, message: any) {
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

  async send(chat: Chat, message: CreateMessageDto): Promise<any[]> {
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
}
