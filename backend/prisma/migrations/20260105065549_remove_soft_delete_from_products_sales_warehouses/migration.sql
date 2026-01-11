/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `SalesPerson` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Warehouse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "SalesPerson" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Warehouse" DROP COLUMN "deletedAt";
