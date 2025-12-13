-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesPerson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "clients" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,
    "salesPersonId" TEXT NOT NULL,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "totalPayment" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "profit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_code_key" ON "Transaction"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "SalesPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
