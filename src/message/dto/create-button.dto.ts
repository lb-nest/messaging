import {
  IsEnum,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ButtonType } from '../enums/button-type.enum';

export class CreateButtonDto {
  @IsEnum(ButtonType)
  type: ButtonType;

  @IsString()
  @MaxLength(20)
  text: string;

  @ValidateIf((object: CreateButtonDto) => object.type === ButtonType.Url)
  @IsString()
  @IsUrl()
  url?: string;

  @ValidateIf((object: CreateButtonDto) => object.type === ButtonType.Phone)
  @IsString()
  @IsPhoneNumber()
  phone?: string;
}
