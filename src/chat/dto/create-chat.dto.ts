import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateChatDto {
  @IsInt()
  channelId: number;

  @IsString()
  accountId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
