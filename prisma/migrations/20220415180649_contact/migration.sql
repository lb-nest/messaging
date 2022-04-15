/*
  Warnings:

  - A unique constraint covering the columns `[contactId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `Contact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Chat_contactId_key` ON `Chat`(`contactId`);

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
