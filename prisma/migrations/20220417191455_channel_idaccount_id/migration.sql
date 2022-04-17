/*
  Warnings:

  - A unique constraint covering the columns `[channelId,accountId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Chat_accountId_key` ON `chat`;

-- CreateIndex
CREATE UNIQUE INDEX `Chat_channelId_accountId_key` ON `Chat`(`channelId`, `accountId`);
