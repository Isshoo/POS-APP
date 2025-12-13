-- AlterTable
ALTER TABLE "SalesPerson" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "deletedAt" TIMESTAMP(3);
