import { PartialType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsInt()
  id: number;
}
