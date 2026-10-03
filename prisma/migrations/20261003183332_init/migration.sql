-- CreateEnum
CREATE TYPE "StockLogType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "defaultMinThreshold" INTEGER NOT NULL DEFAULT 10,
    "categoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_inventory" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minThresholdQty" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_logs" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "type" "StockLogType" NOT NULL,
    "qtyChange" INTEGER NOT NULL,
    "qtyBefore" INTEGER NOT NULL,
    "qtyAfter" INTEGER NOT NULL,
    "note" TEXT,
    "transferId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfers" (
    "id" SERIAL NOT NULL,
    "fromStoreId" INTEGER NOT NULL,
    "toStoreId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_code_key" ON "stores"("code");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "items_sku_key" ON "items"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "store_inventory_storeId_itemId_key" ON "store_inventory"("storeId", "itemId");

-- CreateIndex
CREATE INDEX "stock_logs_storeId_createdAt_idx" ON "stock_logs"("storeId", "createdAt");

-- CreateIndex
CREATE INDEX "stock_logs_itemId_createdAt_idx" ON "stock_logs"("itemId", "createdAt");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_inventory" ADD CONSTRAINT "store_inventory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_inventory" ADD CONSTRAINT "store_inventory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "stock_transfers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_fromStoreId_fkey" FOREIGN KEY ("fromStoreId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_toStoreId_fkey" FOREIGN KEY ("toStoreId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
