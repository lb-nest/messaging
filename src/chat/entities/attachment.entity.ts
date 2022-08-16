import Prisma from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Attachment implements Prisma.Attachment {
  @Exclude()
  id: number;

  @Exclude()
  contentId: number;

  type: Prisma.AttachmentType;

  url: string;

  name: string | null;
}
