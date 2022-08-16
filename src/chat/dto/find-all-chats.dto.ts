import { IsInt, IsOptional } from 'class-validator';

export class FindAllChatsDto {
  @IsOptional()
  @IsInt({ each: true })
  ids?: number[];
}
