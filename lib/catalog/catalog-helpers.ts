import type { PublicCatalogDto, ProductPriceDto } from '@/types/catalog'
import type { CollarElement, DeliveryMethod, ProductType } from '@/types/collar'
import { getFallbackEmojis } from '@/lib/catalog/fallback-emojis'

const ELEMENT_COLOR_NAMES: Record<string, string> = {
  '#FAFAFA': 'Blanco',
  '#1B1B1B': 'Negro',
  '#FAC2DD': 'Rosa',
  '#FEF31B': 'Amarillo',
  '#F6732D': 'Naranja',
  '#93CDF5': 'Celeste',
  '#8CE186': 'Verde',
  '#E0374E': 'Rojo',
  '#0041B9': 'Azul',
  '#E1CBF1': 'Lila',
}

const DEFAULT_SHIPPING_ARS: Record<DeliveryMethod, number> = {
  PICKUP: 0,
  CORREO_SUCURSAL: 8000,
  CORREO_DOMICILIO: 12000,
}

export function findProductPrice(
  catalog: PublicCatalogDto,
  productType: ProductType
): ProductPriceDto | undefined {
  return catalog.productPrices.find((price) => price.productType === productType)
}

export function getDefaultBaseColor(catalog: PublicCatalogDto): string {
  return catalog.baseColors[0]?.hexValue ?? '#C70F11'
}

export function getDefaultElementColor(catalog: PublicCatalogDto): string {
  return catalog.elementColors[0]?.hexValue ?? '#FAFAFA'
}

export function getBaseColorName(catalog: PublicCatalogDto, hexValue: string): string {
  return catalog.baseColors.find((color) => color.hexValue === hexValue)?.name ?? hexValue
}

export function getElementColorName(hexValue: string): string {
  return ELEMENT_COLOR_NAMES[hexValue.toUpperCase()] ?? ELEMENT_COLOR_NAMES[hexValue] ?? hexValue
}

export function resolveShippingAmount(
  shippingPrices: PublicCatalogDto['shippingPrices'],
  deliveryMethod: DeliveryMethod
): number {
  const fromCatalog = shippingPrices.find(
    (price) => price.deliveryMethod === deliveryMethod
  )
  if (fromCatalog) {
    return fromCatalog.amountArs
  }
  return DEFAULT_SHIPPING_ARS[deliveryMethod]
}

export function getShippingAmount(
  catalog: PublicCatalogDto,
  deliveryMethod: DeliveryMethod
): number {
  return resolveShippingAmount(catalog.shippingPrices, deliveryMethod)
}

export function getAllowedElementColors(
  catalog: PublicCatalogDto,
  element: CollarElement
): string[] {
  if (element.type === 'letter') {
    const letter = catalog.letters.find(
      (entry) => entry.letter === element.value && entry.isActive
    )
    if (letter && letter.colors.length > 0) {
      return letter.colors.map((color) => color.hexValue)
    }
  }

  if (element.type === 'emoji') {
    const emoji = catalog.emojis.find(
      (entry) => entry.key === element.value && entry.isActive
    )
    if (emoji && emoji.colors.length > 0) {
      return emoji.colors.map((color) => color.hexValue)
    }
  }

  return catalog.elementColors.map((color) => color.hexValue)
}

export function getActiveEmojis(catalog: PublicCatalogDto, size: '1' | '2') {
  const emojis = catalog.emojis.length > 0 ? catalog.emojis : getFallbackEmojis()

  return emojis.filter(
    (emoji) => emoji.isActive && emoji.availableSizes.includes(size)
  )
}

export function isEmojiAllowedForSize(
  catalog: PublicCatalogDto,
  emojiKey: string,
  size: '1' | '2'
): boolean {
  const emojis = catalog.emojis.length > 0 ? catalog.emojis : getFallbackEmojis()
  const emoji = emojis.find((entry) => entry.key === emojiKey)
  if (!emoji) return false
  return emoji.isActive && emoji.availableSizes.includes(size)
}

export function filterElementsForSize(
  catalog: PublicCatalogDto,
  elements: CollarElement[],
  size: '1' | '2'
): CollarElement[] {
  return elements.filter((element) => {
    if (element.type !== 'emoji') return true
    return isEmojiAllowedForSize(catalog, element.value, size)
  })
}

export function getActiveLetters(catalog: PublicCatalogDto): string[] {
  const letters = catalog.letters
    .filter((entry) => entry.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((entry) => entry.letter)

  if (letters.length > 0) {
    // La Ñ puede faltar en seeds antiguos; siempre incluirla en el teclado
    if (!letters.includes('Ñ')) {
      letters.push('Ñ')
    }
    return letters
  }

  return 'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('')
}
