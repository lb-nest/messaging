import { IsString } from 'class-validator';

export class WebchatEventDto {
  @IsString()
  message: string;

  @IsString()
  session_id: string;
}
