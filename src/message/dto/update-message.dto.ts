import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { FindOneMessageDto } from './find-one-message.dto';

export class UpdateMessageDto extends IntersectionType(
  FindOneMessageDto,
  PartialType(CreateMessageDto),
) {}
