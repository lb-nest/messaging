import { Exclude, Type } from 'class-transformer';
import { Approval } from './approval.entity';
import Prisma from '@prisma/client';

export class Hsm implements Prisma.Hsm {
  id: number;

  @Exclude()
  projectId: number;

  code: string;

  @Type(() => Approval)
  approval: Approval[];

  text: string;

  attachments: any;

  buttons: any;

  createdAt: Date;

  updatedAt: Date;
}
