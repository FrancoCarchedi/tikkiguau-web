-- CreateEnum
CREATE TYPE "WholesaleOrderStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "wholesale_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "status" "WholesaleOrderStatus" NOT NULL DEFAULT 'NEW',
    "totalUnits" INTEGER NOT NULL,
    "totalAmountArs" INTEGER NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wholesale_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wholesale_orders_orderNumber_key" ON "wholesale_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "wholesale_orders_status_createdAt_idx" ON "wholesale_orders"("status", "createdAt");
