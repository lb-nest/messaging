import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateMessageDto } from './create-template-message.dto';

export class UpdateTemplateMessageDto extends PartialType(
  CreateTemplateMessageDto,
) {}
