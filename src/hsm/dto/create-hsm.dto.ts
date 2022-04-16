import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHsmDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  code: string;

  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  text: string;

  @IsOptional()
  @IsArray()
  buttons?: any[];
}
