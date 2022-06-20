import { IsInt } from 'class-validator';

export class ReadMessagesDto {
  @IsInt({ each: true })
  ids: number[];
}
