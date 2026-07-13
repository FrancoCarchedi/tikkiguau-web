import { prisma } from '@/lib/prisma'
import type { PublicCatalogDto } from '@/types/catalog'
import {
  mapBaseColor,
  mapElementColor,
  mapEmoji,
  mapLetter,
  mapProductPrice,
  mapShippingPrice,
} from './mappers'

export async function getPublicCatalog(): Promise<PublicCatalogDto> {
  const [baseColors, elementColors, letters, emojis, productPrices, shippingPrices] =
    await Promise.all([
      prisma.catalogBaseColor.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.catalogElementColor.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.catalogLetter.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          colors: {
            where: { elementColor: { isActive: true } },
            include: { elementColor: true },
          },
        },
      }),
      prisma.catalogEmoji.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          colors: {
            where: { elementColor: { isActive: true } },
            include: { elementColor: true },
          },
        },
      }),
      prisma.productPrice.findMany({
        orderBy: { productType: 'asc' },
      }),
      prisma.shippingPrice.findMany({
        orderBy: { deliveryMethod: 'asc' },
      }),
    ])

  return {
    baseColors: baseColors.map(mapBaseColor),
    elementColors: elementColors.map(mapElementColor),
    letters: letters.map(mapLetter),
    emojis: emojis
      .filter((emoji) => emoji.svgMarkup.trim().length > 0)
      .map(mapEmoji),
    productPrices: productPrices.map(mapProductPrice),
    shippingPrices: shippingPrices.map(mapShippingPrice),
  }
}

export async function getAdminCatalogSnapshot() {
  const [baseColors, elementColors, letters, emojis, productPrices, shippingPrices] =
    await Promise.all([
      prisma.catalogBaseColor.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.catalogElementColor.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.catalogLetter.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          colors: { include: { elementColor: true } },
        },
      }),
      prisma.catalogEmoji.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          colors: { include: { elementColor: true } },
        },
      }),
      prisma.productPrice.findMany({ orderBy: { productType: 'asc' } }),
      prisma.shippingPrice.findMany({ orderBy: { deliveryMethod: 'asc' } }),
    ])

  return {
    baseColors: baseColors.map(mapBaseColor),
    elementColors: elementColors.map(mapElementColor),
    letters: letters.map(mapLetter),
    emojis: emojis.map(mapEmoji),
    productPrices: productPrices.map(mapProductPrice),
    shippingPrices: shippingPrices.map(mapShippingPrice),
  }
}
