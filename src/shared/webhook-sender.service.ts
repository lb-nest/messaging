import { Injectable } from '@nestjs/common';
import { WebhookEventType } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';
import { WebhookEvent } from './interfaces/webhook-event.interface';

@Injectable()
export class WebhookSenderService {
  constructor(private readonly prismaService: PrismaService) {}

  dispatch(projectId: number, event: WebhookEvent): void {
    this.dispatchAsync(projectId, event).catch(() => null);
  }

  async dispatchAsync(projectId: number, event: WebhookEvent): Promise<void> {
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
