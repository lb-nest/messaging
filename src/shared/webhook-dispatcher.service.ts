import { Injectable } from '@nestjs/common';
import { WebhookEventType } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';
import { IWebhookEvent } from './interfaces/webhook-event.interface';

@Injectable()
export class WebhookDispatcher {
  constructor(private readonly prismaService: PrismaService) {}

  async dispatch(projectId: number, event: IWebhookEvent) {
    const webhooks = await this.prismaService.webhook.findMany({
      where: {
        projectId,
        eventType: {
          in: [event.type, WebhookEventType.All],
        },
      },
    });

    await Promise.allSettled(
      webhooks.map((webhook) => axios.post(webhook.url, event)),
    );
  }
}
