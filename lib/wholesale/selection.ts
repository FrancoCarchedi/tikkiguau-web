import type { PublicCatalogDto } from '@/types/catalog'
import type {
  PublicWholesaleConfig,
  WholesaleCategory,
  WholesaleSizeValue,
} from '@/types/wholesale'
import { getAvailableCategories, getAvailableSizes, getColorOptions } from './catalog-options'

export interface WholesaleSelection {
  category: WholesaleCategory
  size: WholesaleSizeValue
  colorHex: string
}

/** Ajusta la selección a lo realmente disponible (reglas activas y colores vigentes). */
export function normalizeSelection(
  selection: Partial<WholesaleSelection> | null,
  catalog: PublicCatalogDto,
  config: PublicWholesaleConfig
): WholesaleSelection | null {
  const categories = getAvailableCategories(config)
  const category =
    selection?.category && categories.includes(selection.category)
      ? selection.category
      : categories[0]
  if (!category) return null

  const sizes = getAvailableSizes(config, category)
  const size = selection?.size && sizes.includes(selection.size) ? selection.size : sizes[0]
  if (!size) return null

  const colors = getColorOptions(catalog, category)
  const currentColor = colors.find(
    (color) => color.hexValue.toUpperCase() === selection?.colorHex?.toUpperCase()
  )
  const colorHex = currentColor?.hexValue ?? colors[0]?.hexValue ?? ''

  return { category, size, colorHex }
}
