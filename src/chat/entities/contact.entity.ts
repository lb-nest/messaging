import Prisma from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Contact implements Prisma.Contact {
  @Exclude()
  chatId: number;

  name: string;

  avatarUrl: string | null;
}
