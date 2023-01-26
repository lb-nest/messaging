import { IsInt, IsString } from 'class-validator';

export class FindAllMessagesDto {
  @IsInt()
  channelId: number;

  @IsString()
  accountId: string;
}
