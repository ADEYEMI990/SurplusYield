/*
  Warnings:

  - You are about to drop the column `roiEarned` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "roiEarned" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "roiEarned",
ADD COLUMN     "investmentId" TEXT;
