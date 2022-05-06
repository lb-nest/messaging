-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "accountId" TEXT;

-- CreateIndex
CREATE INDEX "Channel_accountId_idx" ON "Channel"("accountId");
