import { IsInt } from 'class-validator';

export class ReadMessagesDto {
  @IsInt()
  chatId: number;

  @IsInt({ each: true })
  ids: number[];
}
