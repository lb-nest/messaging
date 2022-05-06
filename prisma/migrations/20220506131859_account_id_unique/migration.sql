/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Channel_accountId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Channel_accountId_key" ON "Channel"("accountId");
