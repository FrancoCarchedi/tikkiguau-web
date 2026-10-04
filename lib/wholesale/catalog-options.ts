import {
  getActiveEmojis,
  getActiveLetters,
  getBaseColorName,
  getElementColorName,
} from '@/lib/catalog/catalog-helpers'
import type { PublicCatalogDto } from '@/types/catalog'
import type {
  PublicWholesaleConfig,
  WholesaleCategory,
  WholesaleOrderLine,
  WholesaleSizeValue,
} from '@/types/wholesale'
import { PLAIN_ITEM_KEY, WHOLESALE_CATEGORIES, WHOLESALE_SIZES } from './constants'
import { findPriceRule, type WholesaleSortContext } from './order-calculator'

export interface WholesaleColorOption {
  hexValue: string
  name: string
}

export interface WholesaleItemOption {
  key: string
  label: string
}

export function getAvailableCategories(config: PublicWholesaleConfig): WholesaleCategory[] {
  return WHOLESALE_CATEGORIES.filter((category) =>
    config.priceRules.some((rule) => rule.category === category)
  )
}

export function getAvailableSizes(
  config: PublicWholesaleConfig,
  category: WholesaleCategory
): WholesaleSizeValue[] {
  return WHOLESALE_SIZES.filter((size) => findPriceRule(config.priceRules, category, size))
}

export function getColorOptions(
  catalog: PublicCatalogDto,
  category: WholesaleCategory
): WholesaleColorOption[] {
  if (category === 'COLLAR' || category === 'LEASH') {
    return catalog.baseColors
      .filter((color) => color.isActive)
      .map((color) => ({ hexValue: color.hexValue, name: color.name }))
  }

  return catalog.elementColors
    .filter((color) => color.isActive)
    .map((color) => ({ hexValue: color.hexValue, name: getElementColorName(color.hexValue) }))
}

export function getColorName(
  catalog: PublicCatalogDto,
  category: WholesaleCategory,
  colorHex: string
): string {
  if (category === 'COLLAR' || category === 'LEASH') {
    return getBaseColorName(catalog, colorHex)
  }
  return getElementColorName(colorHex)
}

function colorMatches(allowedHexValues: string[], colorHex: string): boolean {
  return allowedHexValues.some((hex) => hex.toUpperCase() === colorHex.toUpperCase())
}

/** Misma regla que el diseñador: sin colores asignados, la letra admite toda la paleta. */
export function getLetterOptions(
  catalog: PublicCatalogDto,
  colorHex: string
): WholesaleItemOption[] {
  return getActiveLetters(catalog)
    .filter((letter) => {
      const entry = catalog.letters.find((candidate) => candidate.letter === letter)
      if (!entry || entry.colors.length === 0) return true
      return colorMatches(
        entry.colors.map((color) => color.hexValue),
        colorHex
      )
    })
    .map((letter) => ({ key: letter, label: letter }))
}

export function getEmojiOptions(
  catalog: PublicCatalogDto,
  size: WholesaleSizeValue,
  colorHex: string
): WholesaleItemOption[] {
  return getActiveEmojis(catalog, size)
    .filter(
      (emoji) =>
        emoji.colors.length === 0 ||
        colorMatches(
          emoji.colors.map((color) => color.hexValue),
          colorHex
        )
    )
    .map((emoji) => ({ key: emoji.key, label: emoji.label }))
}

export function getItemLabel(
  catalog: PublicCatalogDto,
  category: WholesaleCategory,
  itemKey: string
): string {
  if (category === 'EMOJI') {
    return catalog.emojis.find((emoji) => emoji.key === itemKey)?.label ?? itemKey
  }
  return itemKey
}

export function buildSortContext(catalog: PublicCatalogDto): WholesaleSortContext {
  const letterOrder = getActiveLetters(catalog)

  return {
    colorIndex: (category, colorHex) => {
      const options = getColorOptions(catalog, category)
      const index = options.findIndex(
        (option) => option.hexValue.toUpperCase() === colorHex.toUpperCase()
      )
      return index === -1 ? Number.MAX_SAFE_INTEGER : index
    },
    itemIndex: (category, itemKey) => {
      if (category === 'LETTER') {
        const index = letterOrder.indexOf(itemKey)
        return index === -1 ? Number.MAX_SAFE_INTEGER : index
      }
      if (category === 'EMOJI') {
        const index = catalog.emojis.findIndex((emoji) => emoji.key === itemKey)
        return index === -1 ? Number.MAX_SAFE_INTEGER : index
      }
      return 0
    },
  }
}

/** Una línea es válida si su regla, color e ítem siguen disponibles en la configuración y el catálogo actuales. */
export function isLineAvailable(
  line: WholesaleOrderLine,
  catalog: PublicCatalogDto,
  config: PublicWholesaleConfig
): boolean {
  if (!findPriceRule(config.priceRules, line.category, line.size)) return false

  const colorIsAvailable = getColorOptions(catalog, line.category).some(
    (color) => color.hexValue.toUpperCase() === line.colorHex.toUpperCase()
  )
  if (!colorIsAvailable) return false

  if (line.category === 'COLLAR' || line.category === 'LEASH') {
    return line.itemKey === PLAIN_ITEM_KEY
  }

  const items =
    line.category === 'LETTER'
      ? getLetterOptions(catalog, line.colorHex)
      : getEmojiOptions(catalog, line.size, line.colorHex)

  return items.some((item) => item.key === line.itemKey)
}
