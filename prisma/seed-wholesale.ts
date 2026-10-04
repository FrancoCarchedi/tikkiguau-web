import {
  PrismaClient,
  WholesaleCategory,
  WholesaleSize,
} from '../app/generated/prisma/client'

const WHOLESALE_SETTINGS_ID = 'default'
const DEFAULT_MIN_UNITS_PER_COLOR = 25

/**
 * Letras y emojis: valores definidos por Melizza.
 * Collares y correas: valores provisorios (≈50 % del retail, Talla 1 ≈ 92 % de Talla 2),
 * a ajustar desde el CMS.
 */
const SEED_PRICE_RULES = [
  { category: WholesaleCategory.LETTER, size: WholesaleSize.SIZE_2, unitPriceArs: 881 },
  { category: WholesaleCategory.LETTER, size: WholesaleSize.SIZE_1, unitPriceArs: 821 },
  { category: WholesaleCategory.EMOJI, size: WholesaleSize.SIZE_2, unitPriceArs: 1031 },
  { category: WholesaleCategory.EMOJI, size: WholesaleSize.SIZE_1, unitPriceArs: 935 },
  { category: WholesaleCategory.COLLAR, size: WholesaleSize.SIZE_2, unitPriceArs: 10000 },
  { category: WholesaleCategory.COLLAR, size: WholesaleSize.SIZE_1, unitPriceArs: 9200 },
  { category: WholesaleCategory.LEASH, size: WholesaleSize.SIZE_2, unitPriceArs: 13000 },
  { category: WholesaleCategory.LEASH, size: WholesaleSize.SIZE_1, unitPriceArs: 12000 },
] as const

/** Idempotente y no destructivo: no pisa valores ya editados desde el CMS. */
export async function seedWholesale(prisma: PrismaClient) {
  console.log('Sembrando reglas mayoristas...')

  for (const rule of SEED_PRICE_RULES) {
    await prisma.wholesalePriceRule.upsert({
      where: { category_size: { category: rule.category, size: rule.size } },
      update: {},
      create: {
        category: rule.category,
        size: rule.size,
        unitPriceArs: rule.unitPriceArs,
        minUnitsPerColor: DEFAULT_MIN_UNITS_PER_COLOR,
        isActive: true,
      },
    })
  }

  await prisma.wholesaleSettings.upsert({
    where: { id: WHOLESALE_SETTINGS_ID },
    update: {},
    create: { id: WHOLESALE_SETTINGS_ID },
  })

  const [ruleCount, settingsCount] = await Promise.all([
    prisma.wholesalePriceRule.count(),
    prisma.wholesaleSettings.count(),
  ])

  console.log(`✓ Mayorista sembrado: ${ruleCount} reglas de precio, ${settingsCount} fila de ajustes`)
}
