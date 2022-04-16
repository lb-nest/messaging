import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateWebhookDto } from './create-webhook.dto';

export class UpdateWebhookDto extends PickType(PartialType(CreateWebhookDto), [
  'name',
]) {}
