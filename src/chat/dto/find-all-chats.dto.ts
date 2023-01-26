import { IsOptional, IsString } from 'class-validator';

export class FindAllChatsDto {
  @IsOptional()
  @IsString({ each: true })
  accountIds?: string[];
}
