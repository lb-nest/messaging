-- AlterTable
ALTER TABLE `message` MODIFY `status` ENUM('Accepted', 'Delivered', 'Read', 'Error') NOT NULL;
