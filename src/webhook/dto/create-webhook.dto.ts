import { WebhookEventType } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  name: string;

  @IsUrl()
  url: string;

  @IsEnum(WebhookEventType)
  eventType: WebhookEventType;
}
