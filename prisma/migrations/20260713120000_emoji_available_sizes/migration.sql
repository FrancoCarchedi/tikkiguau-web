-- AlterTable
ALTER TABLE "catalog_emojis"
ADD COLUMN "availableSizes" TEXT[] NOT NULL DEFAULT ARRAY['1', '2']::TEXT[];

-- Pez solo disponible en talla 1 (comportamiento previo hardcodeado en frontend)
UPDATE "catalog_emojis"
SET "availableSizes" = ARRAY['1']::TEXT[]
WHERE "key" = 'pez';
