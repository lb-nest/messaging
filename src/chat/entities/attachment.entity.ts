import { AttachmentType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Attachment {
  @Exclude()
  id: number;

  @Exclude()
  contentId: number;

  type: AttachmentType;

  url: string;

  name?: string;
}
