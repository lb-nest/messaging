import { Injectable } from '@nestjs/common';
import { MessageStatus, WebhookEventType } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/prisma.service';
import { TelegramApiChannel } from 'src/shared/telegram.api-channel';
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
          create: await TelegramApiChannel.createContact(
            bot,
            messageFromTelegram,
          ),
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

    await this.webhookSenderService.dispatch(channel.projectId, {
      type: WebhookEventType.IncomingMessages,
      payload: [message],
    });

    return 'ok';
  }
}
