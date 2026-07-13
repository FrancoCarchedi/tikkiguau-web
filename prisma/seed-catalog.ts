import {
  CatalogProductType,
  DeliveryMethod,
  PrismaClient,
} from '../app/generated/prisma/client'
import { getSeedEmojiSvgMarkup } from './emoji-svg-seed'

const SEED_BASE_COLORS = [
  { name: 'Rojo', value: '#C70F11' },
  { name: 'Celeste', value: '#2590B4' },
  { name: 'Verde manzana', value: '#84A308' },
  { name: 'Naranja', value: '#D93C1B' },
  { name: 'Negro', value: '#111111' },
  { name: 'Rosado', value: '#C7295C' },
  { name: 'Violeta', value: '#4B2A61' },
  { name: 'Azul', value: '#1C5394' },
  { name: 'Verde oscuro', value: '#2A6A5C' },
] as const

const SEED_ELEMENT_COLORS = [
  '#FAFAFA', '#1B1B1B', '#FAC2DD', '#FEF31B',
  '#F6732D', '#93CDF5', '#8CE186', '#E0374E',
  '#0041B9', '#E1CBF1',
] as const

const SEED_EMOJIS = [
  { key: 'patitas', label: 'Patitas', availableSizes: ['1', '2'] as const },
  { key: 'corazon', label: 'Corazón', availableSizes: ['1', '2'] as const },
  { key: 'estrella', label: 'Estrella', availableSizes: ['1', '2'] as const },
  { key: 'calavera', label: 'Calavera', availableSizes: ['1', '2'] as const },
  { key: 'energia', label: 'Energía', availableSizes: ['1', '2'] as const },
  { key: 'flor', label: 'Flor', availableSizes: ['1', '2'] as const },
  { key: 'luna', label: 'Luna', availableSizes: ['1', '2'] as const },
  { key: 'pez', label: 'Pez', availableSizes: ['1'] as const },
] as const

const SEED_PRODUCTS = [
  { type: 'collar' as const, label: 'Collar', priceNumber: 20000, description: 'Incluye collar y 6 piezas en total.', pieces: 6 },
  { type: 'leash' as const, label: 'Correa', priceNumber: 26000, description: 'Incluye correa y 10 piezas en total.', pieces: 10 },
  { type: 'both' as const, label: 'Combo', priceNumber: 39000, description: 'Incluye correa y collar. 16 piezas en total.', pieces: 16 },
]

export async function seedCatalog(prisma: PrismaClient) {
  console.log('Sembrando catálogo...')

  for (const [index, color] of SEED_BASE_COLORS.entries()) {
    await prisma.catalogBaseColor.upsert({
      where: { hexValue: color.value },
      update: {
        name: color.name,
        sortOrder: index,
        isActive: true,
      },
      create: {
        name: color.name,
        hexValue: color.value,
        sortOrder: index,
        isActive: true,
      },
    })
  }

  const elementColorRecords = []
  for (const [index, hexValue] of SEED_ELEMENT_COLORS.entries()) {
    const record = await prisma.catalogElementColor.upsert({
      where: { hexValue },
      update: {
        sortOrder: index,
        isActive: true,
      },
      create: {
        hexValue,
        sortOrder: index,
        isActive: true,
      },
    })
    elementColorRecords.push(record)
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÑ'.split('')
  for (const [index, letter] of letters.entries()) {
    const letterRecord = await prisma.catalogLetter.upsert({
      where: { letter },
      update: {
        sortOrder: index,
        isActive: true,
      },
      create: {
        letter,
        sortOrder: index,
        isActive: true,
      },
    })

    await prisma.catalogLetterColor.deleteMany({
      where: { letterId: letterRecord.id },
    })

    await prisma.catalogLetterColor.createMany({
      data: elementColorRecords.map((color) => ({
        letterId: letterRecord.id,
        elementColorId: color.id,
      })),
      skipDuplicates: true,
    })
  }

  for (const [index, emoji] of SEED_EMOJIS.entries()) {
    const svgMarkup = getSeedEmojiSvgMarkup(emoji.key)
    const emojiRecord = await prisma.catalogEmoji.upsert({
      where: { key: emoji.key },
      update: {
        label: emoji.label,
        svgMarkup,
        sortOrder: index,
        isActive: true,
        availableSizes: [...emoji.availableSizes],
      },
      create: {
        key: emoji.key,
        label: emoji.label,
        svgMarkup,
        sortOrder: index,
        isActive: true,
        availableSizes: [...emoji.availableSizes],
      },
    })

    await prisma.catalogEmojiColor.deleteMany({
      where: { emojiId: emojiRecord.id },
    })

    await prisma.catalogEmojiColor.createMany({
      data: elementColorRecords.map((color) => ({
        emojiId: emojiRecord.id,
        elementColorId: color.id,
      })),
      skipDuplicates: true,
    })
  }

  const productTypeMap = {
    collar: CatalogProductType.COLLAR,
    leash: CatalogProductType.LEASH,
    both: CatalogProductType.BOTH,
  } as const

  for (const product of SEED_PRODUCTS) {
    await prisma.productPrice.upsert({
      where: { productType: productTypeMap[product.type] },
      update: {
        amountArs: product.priceNumber,
        pieces: product.pieces,
        label: product.label,
        description: product.description,
      },
      create: {
        productType: productTypeMap[product.type],
        amountArs: product.priceNumber,
        pieces: product.pieces,
        label: product.label,
        description: product.description,
      },
    })
  }

  await prisma.shippingPrice.upsert({
    where: { deliveryMethod: DeliveryMethod.CORREO_DOMICILIO },
    update: { amountArs: 0 },
    create: {
      deliveryMethod: DeliveryMethod.CORREO_DOMICILIO,
      amountArs: 0,
    },
  })

  await prisma.shippingPrice.upsert({
    where: { deliveryMethod: DeliveryMethod.CORREO_SUCURSAL },
    update: { amountArs: 0 },
    create: {
      deliveryMethod: DeliveryMethod.CORREO_SUCURSAL,
      amountArs: 0,
    },
  })

  const counts = await Promise.all([
    prisma.catalogBaseColor.count(),
    prisma.catalogElementColor.count(),
    prisma.catalogLetter.count(),
    prisma.catalogEmoji.count(),
    prisma.productPrice.count(),
    prisma.shippingPrice.count(),
  ])

  console.log(
    `✓ Catálogo sembrado: ${counts[0]} colores base, ${counts[1]} colores elemento, ${counts[2]} letras, ${counts[3]} emojis, ${counts[4]} precios producto, ${counts[5]} precios envío`
  )
}
