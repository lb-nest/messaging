import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';
import { CreateChannelDto } from './create-channel.dto';

export class UpdateChannelDto extends PartialType(
  PickType(CreateChannelDto, ['name']),
) {
  @IsInt()
  id: number;
}
