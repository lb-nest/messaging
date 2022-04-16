/*
  Warnings:

  - You are about to drop the column `attachments` on the `templatemessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `templatemessage` DROP COLUMN `attachments`,
    MODIFY `buttons` JSON NULL;
