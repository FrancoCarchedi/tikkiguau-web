-- CreateEnum
CREATE TYPE "WholesaleCategory" AS ENUM ('LETTER', 'EMOJI', 'COLLAR', 'LEASH');

-- CreateEnum
CREATE TYPE "WholesaleSize" AS ENUM ('SIZE_1', 'SIZE_2');

-- CreateTable
CREATE TABLE "wholesale_price_rules" (
    "id" TEXT NOT NULL,
    "category" "WholesaleCategory" NOT NULL,
    "size" "WholesaleSize" NOT NULL,
    "unitPriceArs" INTEGER NOT NULL,
    "minUnitsPerColor" INTEGER NOT NULL DEFAULT 25,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wholesale_price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wholesale_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "requireMinTotalUnits" BOOLEAN NOT NULL DEFAULT true,
    "minTotalUnits" INTEGER NOT NULL DEFAULT 250,
    "requireMinTotalAmount" BOOLEAN NOT NULL DEFAULT false,
    "minTotalAmountArs" INTEGER NOT NULL DEFAULT 200000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wholesale_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wholesale_price_rules_category_size_key" ON "wholesale_price_rules"("category", "size");
