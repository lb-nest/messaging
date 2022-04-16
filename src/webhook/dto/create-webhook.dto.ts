import { WebhookEventType } from '@prisma/client';
import { IsEnum, IsString, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsEnum(WebhookEventType)
  eventType: WebhookEventType;
}
