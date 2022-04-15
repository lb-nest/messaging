/*
  Warnings:

  - You are about to drop the column `externalIds` on the `message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` DROP COLUMN `externalIds`,
    ADD COLUMN `externalId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Message_externalId_key` ON `Message`(`externalId`);
