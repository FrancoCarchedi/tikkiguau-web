import type {
  CatalogBaseColor,
  CatalogElementColor,
  CatalogEmoji,
  CatalogLetter,
  ProductPrice,
  ShippingPrice,
} from '@/app/generated/prisma/client'
import { CatalogProductType } from '@/app/generated/prisma/client'
import type {
  CatalogBaseColorDto,
  CatalogElementColorDto,
  CatalogEmojiDto,
  CatalogLetterDto,
  ProductPriceDto,
  ShippingPriceDto,
} from '@/types/catalog'
import type { ProductType } from '@/types/collar'

export function mapBaseColor(color: CatalogBaseColor): CatalogBaseColorDto {
  return {
    id: color.id,
    name: color.name,
    hexValue: color.hexValue,
    isActive: color.isActive,
    sortOrder: color.sortOrder,
  }
}

export function mapElementColor(color: CatalogElementColor): CatalogElementColorDto {
  return {
    id: color.id,
    hexValue: color.hexValue,
    isActive: color.isActive,
    sortOrder: color.sortOrder,
  }
}

export function mapLetter(
  letter: CatalogLetter & {
    colors: { elementColor: CatalogElementColor }[]
  }
): CatalogLetterDto {
  const colors = letter.colors.map((entry) => mapElementColor(entry.elementColor))
  return {
    id: letter.id,
    letter: letter.letter,
    isActive: letter.isActive,
    sortOrder: letter.sortOrder,
    colorIds: colors.map((color) => color.id),
    colors,
  }
}

export function mapEmoji(
  emoji: CatalogEmoji & {
    colors: { elementColor: CatalogElementColor }[]
  }
): CatalogEmojiDto {
  const colors = emoji.colors.map((entry) => mapElementColor(entry.elementColor))
  const rawSizes = emoji.availableSizes ?? ['1', '2']
  const availableSizes = rawSizes.filter(
    (size): size is '1' | '2' => size === '1' || size === '2'
  )

  return {
    id: emoji.id,
    key: emoji.key,
    label: emoji.label,
    svgMarkup: emoji.svgMarkup,
    isActive: emoji.isActive,
    sortOrder: emoji.sortOrder,
    availableSizes: availableSizes.length > 0 ? availableSizes : ['1', '2'],
    colorIds: colors.map((color) => color.id),
    colors,
  }
}

const PRODUCT_TYPE_TO_API: Record<CatalogProductType, ProductType> = {
  [CatalogProductType.COLLAR]: 'collar',
  [CatalogProductType.LEASH]: 'leash',
  [CatalogProductType.BOTH]: 'both',
}

const PRODUCT_TYPE_FROM_API: Record<ProductType, CatalogProductType> = {
  collar: CatalogProductType.COLLAR,
  leash: CatalogProductType.LEASH,
  both: CatalogProductType.BOTH,
}

export function mapProductPrice(price: ProductPrice): ProductPriceDto {
  return {
    id: price.id,
    productType: PRODUCT_TYPE_TO_API[price.productType],
    amountArs: price.amountArs,
    pieces: price.pieces,
    label: price.label,
    description: price.description,
  }
}

export function toCatalogProductType(productType: ProductType): CatalogProductType {
  return PRODUCT_TYPE_FROM_API[productType]
}

export function mapShippingPrice(price: ShippingPrice): ShippingPriceDto {
  return {
    id: price.id,
    deliveryMethod: price.deliveryMethod,
    amountArs: price.amountArs,
  }
}
