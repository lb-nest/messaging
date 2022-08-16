import { Exclude, Type } from 'class-transformer';
import { Attachment } from './attachment.entity';
import Prisma from '@prisma/client';

export class Content implements Prisma.Content {
  @Exclude()
  id: number;

  @Exclude()
  messageId: number;

  text: string | null;

  @Type(() => Attachment)
  attachments: Attachment[];

  buttons: any;
}
