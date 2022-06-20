-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ChannelType" ADD VALUE 'Instagram';
ALTER TYPE "ChannelType" ADD VALUE 'Vkontakte';

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "unreadCount" INTEGER NOT NULL DEFAULT 0;