-- CreateEnum
CREATE TYPE "CatalogProductType" AS ENUM ('COLLAR', 'LEASH', 'BOTH');

-- DeliveryMethod may already exist from orders table (shared DB / prior db push)
DO $$ BEGIN
    CREATE TYPE "DeliveryMethod" AS ENUM ('PICKUP', 'CORREO_DOMICILIO', 'CORREO_SUCURSAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE "catalog_base_colors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hexValue" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_base_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_element_colors" (
    "id" TEXT NOT NULL,
    "hexValue" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_element_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_letters" (
    "id" TEXT NOT NULL,
    "letter" CHAR(1) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_letter_colors" (
    "letterId" TEXT NOT NULL,
    "elementColorId" TEXT NOT NULL,

    CONSTRAINT "catalog_letter_colors_pkey" PRIMARY KEY ("letterId","elementColorId")
);

-- CreateTable
CREATE TABLE "catalog_emojis" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "svgMarkup" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_emojis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_emoji_colors" (
    "emojiId" TEXT NOT NULL,
    "elementColorId" TEXT NOT NULL,

    CONSTRAINT "catalog_emoji_colors_pkey" PRIMARY KEY ("emojiId","elementColorId")
);

-- CreateTable
CREATE TABLE "product_prices" (
    "id" TEXT NOT NULL,
    "productType" "CatalogProductType" NOT NULL,
    "amountArs" INTEGER NOT NULL,
    "pieces" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_prices" (
    "id" TEXT NOT NULL,
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "amountArs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalog_base_colors_hexValue_key" ON "catalog_base_colors"("hexValue");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_element_colors_hexValue_key" ON "catalog_element_colors"("hexValue");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_letters_letter_key" ON "catalog_letters"("letter");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_emojis_key_key" ON "catalog_emojis"("key");

-- CreateIndex
CREATE UNIQUE INDEX "product_prices_productType_key" ON "product_prices"("productType");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_prices_deliveryMethod_key" ON "shipping_prices"("deliveryMethod");

-- AddForeignKey
ALTER TABLE "catalog_letter_colors" ADD CONSTRAINT "catalog_letter_colors_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "catalog_letters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_letter_colors" ADD CONSTRAINT "catalog_letter_colors_elementColorId_fkey" FOREIGN KEY ("elementColorId") REFERENCES "catalog_element_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_emoji_colors" ADD CONSTRAINT "catalog_emoji_colors_emojiId_fkey" FOREIGN KEY ("emojiId") REFERENCES "catalog_emojis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_emoji_colors" ADD CONSTRAINT "catalog_emoji_colors_elementColorId_fkey" FOREIGN KEY ("elementColorId") REFERENCES "catalog_element_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
