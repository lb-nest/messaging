import { IsInt, IsObject, IsOptional } from 'class-validator';

export class CreateApprovalDto {
  @IsInt()
  channelId: number;

  @IsInt()
  hsmId: number;

  @IsOptional()
  @IsObject()
  payload?: any;
}
