import { prisma } from '@/lib/prisma'
import type { PublicWholesaleConfig, WholesaleSettingsDto } from '@/types/wholesale'
import { WHOLESALE_SETTINGS_ID } from './constants'
import { mapWholesalePriceRule, mapWholesaleSettings } from './mappers'

/** Devuelve los ajustes; si la fila no existe aún la crea con los valores por defecto del schema. */
export async function getWholesaleSettings(): Promise<WholesaleSettingsDto> {
  const settings = await prisma.wholesaleSettings.upsert({
    where: { id: WHOLESALE_SETTINGS_ID },
    update: {},
    create: { id: WHOLESALE_SETTINGS_ID },
  })
  return mapWholesaleSettings(settings)
}

export async function getPublicWholesaleConfig(): Promise<PublicWholesaleConfig> {
  const [settings, rules] = await Promise.all([
    getWholesaleSettings(),
    prisma.wholesalePriceRule.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { size: 'desc' }],
    }),
  ])

  return {
    settings,
    priceRules: rules.map(mapWholesalePriceRule),
  }
}

/** Para Navbar/Footer: ante cualquier falla oculta el enlace en lugar de romper la landing. */
export async function isWholesaleEnabled(): Promise<boolean> {
  try {
    const config = await getPublicWholesaleConfig()
    return config.settings.isEnabled && config.priceRules.length > 0
  } catch {
    return false
  }
}
