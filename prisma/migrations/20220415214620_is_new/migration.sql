-- AlterTable
ALTER TABLE `chat` ADD COLUMN `isNew` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `webhook` MODIFY `eventType` ENUM('NewChats', 'IncomingMessages', 'OutgoingMessages', 'All') NOT NULL;
