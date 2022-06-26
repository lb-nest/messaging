import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateChatDto {
  @IsInt()
  channelId: number;

  @IsString()
  accountId: string;

  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
