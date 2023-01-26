import { IsInt, IsString } from 'class-validator';

export class FindOneChatDto {
  @IsInt()
  channelId: number;

  @IsString()
  accountId: string;
}
