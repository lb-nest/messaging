import { WebhookEventType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Webhook {
  id: number;

  @Exclude()
  projectId: number;

  name: string;

  url: string;

  eventType: WebhookEventType;
}
