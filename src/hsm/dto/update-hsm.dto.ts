import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';
import { CreateHsmDto } from './create-hsm.dto';

export class UpdateHsmDto extends PartialType(
  OmitType(CreateHsmDto, ['code']),
) {
  @IsInt()
  id: number;
}
