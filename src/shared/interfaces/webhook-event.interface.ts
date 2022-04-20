import { WebhookEventType } from '@prisma/client';

export interface WebhookEvent {
  type: WebhookEventType;
  payload: any;
}
