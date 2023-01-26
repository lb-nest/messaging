import { IsInt, IsString } from 'class-validator';

export class FindOneMessageDto {
  @IsInt()
  channelId: number;

  @IsString()
  accountId: string;

  @IsInt()
  id: number;
}
