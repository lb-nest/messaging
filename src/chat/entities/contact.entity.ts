import { Exclude } from 'class-transformer';

export class Contact {
  @Exclude()
  chatId: number;

  username: string;

  name: string;

  avatarUrl?: string;
}
