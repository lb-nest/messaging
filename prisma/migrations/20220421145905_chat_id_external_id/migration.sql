/*
  Warnings:

  - A unique constraint covering the columns `[chatId,externalId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Message_externalId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Message_chatId_externalId_key" ON "Message"("chatId", "externalId");
