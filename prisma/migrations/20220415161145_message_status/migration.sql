/*
  Warnings:

  - The values [LbServer,Server,Device] on the enum `Message_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `message` MODIFY `status` ENUM('Delivered', 'Read', 'Error') NOT NULL;
