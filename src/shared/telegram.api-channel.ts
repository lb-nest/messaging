import * as Prisma from '@prisma/client';
import { plainToClass } from 'class-transformer';
import TelegramBot from 'node-telegram-bot-api';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { Chat } from 'src/chat/entities/chat.entity';
import { MessageWithChatId } from 'src/chat/entities/message-with-chat-id.entity';
import { ApiChannel } from './api-channel.interface';
import { WebhookSenderService } from './webhook-sender.service';

export class TelegramApiChannel extends ApiChannel<TelegramBot.Update> {
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

    const url = this.configService.get<string>('MESSAGING_URL');
    await bot.setWebHook(url.concat(`/channels/${channel.id}/webhook`));

    return channel;
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
          reply_markup: undefined,
        }),
      );
    }

    await Promise.all(
      message.attachments.map(async (attachment) => {
        switch (attachment.type) {
          case Prisma.AttachmentType.Audio:
            messages.push(await bot.sendAudio(chat.accountId, attachment.url));
            break;

          case Prisma.AttachmentType.Document:
          case Prisma.AttachmentType.Video:
            messages.push(
              await bot.sendDocument(chat.accountId, attachment.url, {
                caption: attachment.name,
              }),
            );
            break;

          case Prisma.AttachmentType.Image:
            messages.push(
              await bot.sendPhoto(chat.accountId, attachment.url, {
                caption: attachment.name,
              }),
            );
            break;
        }
      }),
    );

    return Promise.all(
      messages.map(async (message) =>
        plainToClass(
          MessageWithChatId,
          await this.prismaService.message.create({
            data: {
              chatId: chat.id,
              externalId: String(message.message_id),
              fromMe: true,
              status: Prisma.MessageStatus.Delivered,
              content: {
                create: {
                  text: message.text ?? message.caption,
                  attachments: {
                    create: await this.createAttachment(bot, message),
                  },
                  buttons: undefined,
                },
              },
            },
            include: {
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
                include: {
                  attachments: true,
                },
              },
            },
          }),
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

    const accountId = String(telegramMessage.chat.id);
    const bot = new TelegramBot(channel.token);

    const chat = plainToClass(
      Chat,
      await this.prismaService.chat.upsert({
        where: {
          channelId_accountId: {
            channelId: channel.id,
            accountId,
          },
        },
        create: {
          accountId,
          contact: {
            create: await this.createContact(bot, telegramMessage.from),
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
      }),
    );

    const message = plainToClass(
      MessageWithChatId,
      await this.prismaService.message.upsert({
        where: {
          chatId_externalId: {
            chatId: chat.id,
            externalId: String(telegramMessage.message_id),
          },
        },
        create: {
          chatId: chat.id,
          fromMe: false,
          status: Prisma.MessageStatus.Delivered,
          content: {
            create: {
              text: telegramMessage.text ?? telegramMessage.caption,
              attachments: {
                create: await this.createAttachment(bot, telegramMessage),
              },
              buttons: undefined,
            },
          },
          externalId: String(telegramMessage.message_id),
        },
        update: {
          content: {
            create: {
              text: telegramMessage.text ?? telegramMessage.caption,
              attachments: {
                create: await this.createAttachment(bot, telegramMessage),
              },
              buttons: undefined,
            },
          },
          updatedAt: new Date(),
        },
        include: {
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
            include: {
              attachments: true,
            },
          },
        },
      }),
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
    user: TelegramBot.User,
  ): Promise<Omit<Prisma.Contact, 'chatId'>> {
    const userProfile = await bot.getUserProfilePhotos(user.id);
    const photo = userProfile.photos[0]?.at(-1);

    let avatarUrl: string;
    if (photo) {
      avatarUrl = await bot.getFileLink(photo.file_id);
    }

    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return {
      username: user.username,
      name,
      avatarUrl,
    };
  }

  private async createAttachment(
    bot: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<Pick<Prisma.Attachment, 'type' | 'url' | 'name'>> {
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
