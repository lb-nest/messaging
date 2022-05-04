import { Exclude, Type } from 'class-transformer';
import { Approval } from './approval.entity';

export class Hsm {
  id: number;

  @Exclude()
  projectId: number;

  code: string;

  @Type(() => Approval)
  approval: Approval[];

  text: string;

  buttons?: any;

  createdAt: Date;

  updatedAt: Date;
}
