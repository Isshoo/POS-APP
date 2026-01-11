/*
  Warnings:

  - You are about to drop the column `clients` on the `SalesPerson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SalesPerson" DROP COLUMN "clients",
ADD COLUMN     "products" TEXT NOT NULL DEFAULT '';
