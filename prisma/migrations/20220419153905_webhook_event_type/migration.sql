/*
  Warnings:

  - The values [NewChats] on the enum `Webhook_eventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `webhook` MODIFY `eventType` ENUM('IncomingChats', 'OutgoingChats', 'IncomingMessages', 'OutgoingMessages', 'All') NOT NULL;
