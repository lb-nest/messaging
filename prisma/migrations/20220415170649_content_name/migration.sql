/*
  Warnings:

  - You are about to drop the column `caption` on the `attachment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attachment` DROP COLUMN `caption`,
    ADD COLUMN `name` VARCHAR(191) NULL;
