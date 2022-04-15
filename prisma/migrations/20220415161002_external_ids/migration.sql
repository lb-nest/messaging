/*
  Warnings:

  - You are about to drop the column `extednalIds` on the `message` table. All the data in the column will be lost.
  - Added the required column `externalIds` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` DROP COLUMN `extednalIds`,
    ADD COLUMN `externalIds` JSON NOT NULL;
