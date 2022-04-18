import { WebhookEventType } from '@prisma/client';

export interface IWebhookEvent {
  type: WebhookEventType;
  payload: any;
}
