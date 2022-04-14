import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './create-channel.dto';

export class UpdateChannelDto extends PickType(PartialType(CreateChannelDto), [
  'name',
]) {}
