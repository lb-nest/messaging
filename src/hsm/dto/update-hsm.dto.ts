import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateHsmDto } from './create-hsm.dto';

export class UpdateHsmDto extends PartialType(
  OmitType(CreateHsmDto, ['code']),
) {}
