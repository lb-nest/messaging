import { Exclude, Type } from 'class-transformer';
import { Attachment } from './attachment.entity';

export class Content {
  @Exclude()
  id: number;

  @Exclude()
  messageId: number;

  text?: string;

  @Type(() => Attachment)
  attachments: Attachment[];

  buttons?: any;
}
