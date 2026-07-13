import {
  getBaseColorName,
  getElementColorName,
  findProductPrice,
} from '@/lib/catalog/catalog-helpers'
import type { PublicCatalogDto } from '@/types/catalog'
import type { CartItem, CollarDesign, LeashDesign } from '@/types/collar'
import { COLLAR_SIZES, LEASH_SIZES } from '@/types/collar'

export interface PersistedOrderItemElement {
  type: 'letter' | 'emoji'
  value: string
  colorValue: string
  colorName: string
}

export interface PersistedProductPart {
  size: string
  colorValue: string
  colorName: string
  elements: PersistedOrderItemElement[]
}

export interface PersistedOrderItem {
  productType: 'collar' | 'correa' | 'both'
  productLabel: string
  price: number
  collar?: PersistedProductPart
  correa?: PersistedProductPart
}

function transformPart(
  catalog: PublicCatalogDto,
  design: CollarDesign | LeashDesign,
  isCollar: boolean
): PersistedProductPart {
  const colorValue = isCollar
    ? (design as CollarDesign).collarColor
    : (design as LeashDesign).leashColor
  const sizeValue = isCollar
    ? (design as CollarDesign).collarSize
    : (design as LeashDesign).leashSize
  const sizes = isCollar ? COLLAR_SIZES : LEASH_SIZES

  return {
    size: sizes.find((entry) => entry.value === sizeValue)?.label ?? `Talla ${sizeValue}`,
    colorValue,
    colorName: getBaseColorName(catalog, colorValue),
    elements: design.elements.map((element) => ({
      type: element.type,
      value: element.value,
      colorValue: element.color,
      colorName: getElementColorName(element.color),
    })),
  }
}

export function buildOrderItems(
  catalog: PublicCatalogDto,
  items: CartItem[]
): PersistedOrderItem[] {
  return items.map((item) => {
    const product = findProductPrice(catalog, item.productType)

    return {
      productType: item.productType === 'leash' ? 'correa' : item.productType,
      productLabel: product?.label ?? item.productType,
      price: product?.amountArs ?? 0,
      collar: item.collarDesign
        ? transformPart(catalog, item.collarDesign, true)
        : undefined,
      correa: item.leashDesign
        ? transformPart(catalog, item.leashDesign, false)
        : undefined,
    }
  })
}

export function calculateProductsTotal(
  catalog: PublicCatalogDto,
  items: CartItem[]
): number {
  return items.reduce((sum, item) => {
    const product = findProductPrice(catalog, item.productType)
    return sum + (product?.amountArs ?? 0)
  }, 0)
}
