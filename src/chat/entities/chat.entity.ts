import { Exclude, Type } from 'class-transformer';
import { Contact } from './contact.entity';
import { Message } from './message.entity';

export class Chat {
  id: number;

  @Exclude()
  channelId: number;

  @Type(() => Contact)
  contact: Contact;

  @Exclude()
  accountId: string;

  @Exclude()
  isNew: boolean;

  @Type(() => Message)
  messages: Message[];
}
