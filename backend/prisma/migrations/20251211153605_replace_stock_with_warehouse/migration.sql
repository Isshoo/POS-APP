/*
  Warnings:

  - You are about to drop the `StockMovement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_productId_fkey";

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_salesPersonId_fkey";

-- DropTable
DROP TABLE "StockMovement";

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);
