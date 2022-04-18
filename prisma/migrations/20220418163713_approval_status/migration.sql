/*
  Warnings:

  - The values [Approved,Pending,Declined] on the enum `Approval_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `approval` MODIFY `status` ENUM('Requested', 'Approved', 'Rejected') NOT NULL;
