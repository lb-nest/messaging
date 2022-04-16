import { AttachmentType } from '@prisma/client';

interface IAttachment {
  type: AttachmentType;
  url: string;
  name?: string;
}

export interface IMessage {
  text?: string;
  attachments: IAttachment[];
  buttons?: any[];
}
