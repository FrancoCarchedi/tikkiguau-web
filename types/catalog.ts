import type { DeliveryMethod, ProductType } from '@/types/collar'

export interface CatalogBaseColorDto {
  id: string
  name: string
  hexValue: string
  isActive: boolean
  sortOrder: number
}

export interface CatalogElementColorDto {
  id: string
  hexValue: string
  isActive: boolean
  sortOrder: number
}

export interface CatalogLetterDto {
  id: string
  letter: string
  isActive: boolean
  sortOrder: number
  colorIds: string[]
  colors: CatalogElementColorDto[]
}

export interface CatalogEmojiDto {
  id: string
  key: string
  label: string
  svgMarkup: string
  isActive: boolean
  sortOrder: number
  availableSizes: Array<'1' | '2'>
  colorIds: string[]
  colors: CatalogElementColorDto[]
}

export interface ProductPriceDto {
  id: string
  productType: ProductType
  amountArs: number
  pieces: number
  label: string
  description: string
}

export interface ShippingPriceDto {
  id: string
  deliveryMethod: DeliveryMethod
  amountArs: number
}

export interface PublicCatalogDto {
  baseColors: CatalogBaseColorDto[]
  elementColors: CatalogElementColorDto[]
  letters: CatalogLetterDto[]
  emojis: CatalogEmojiDto[]
  productPrices: ProductPriceDto[]
  shippingPrices: ShippingPriceDto[]
}

export function formatArsPrice(amountArs: number): string {
  return `$${amountArs.toLocaleString('es-AR')} ARS`
}
