/*
  Warnings:

  - You are about to drop the column `contactId` on the `chat` table. All the data in the column will be lost.
  - The primary key for the `contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `contact` table. All the data in the column will be lost.
  - Added the required column `chatId` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chat` DROP FOREIGN KEY `Chat_contactId_fkey`;

-- AlterTable
ALTER TABLE `chat` DROP COLUMN `contactId`;

-- AlterTable
ALTER TABLE `contact` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `chatId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`chatId`);

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
