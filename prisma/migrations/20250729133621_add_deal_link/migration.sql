-- AlterEnum
ALTER TYPE "DealType" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "dealLink" TEXT NOT NULL DEFAULT 'Unknown';
