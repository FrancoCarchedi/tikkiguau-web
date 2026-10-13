import { describe, expect, it } from 'vitest'
import { getElementColorName } from '@/lib/catalog/catalog-helpers'
import type { PublicCatalogDto } from '@/types/catalog'
import type {
  PublicWholesaleConfig,
  WholesaleOrderLine,
  WholesaleSettingsDto,
} from '@/types/wholesale'
import { prepareWholesaleOrder } from './prepare-wholesale-order'

const BLUE = '#0041B9'
const BLACK = '#1B1B1B'

const catalog: PublicCatalogDto = {
  baseColors: [{ id: 'b1', name: 'Negro', hexValue: BLACK, isActive: true, sortOrder: 1 }],
  elementColors: [{ id: 'e1', hexValue: BLUE, isActive: true, sortOrder: 1 }],
  letters: ['A', 'B', 'C'].map((letter, index) => ({
    id: `l${index}`,
    letter,
    isActive: true,
    sortOrder: index,
    colorIds: [],
    colors: [],
  })),
  emojis: [
    {
      id: 'm1',
      key: 'heart',
      label: 'Corazón',
      svgMarkup: '<svg />',
      isActive: true,
      sortOrder: 1,
      availableSizes: ['1'],
      colorIds: [],
      colors: [],
    },
  ],
  productPrices: [],
  shippingPrices: [],
}

const baseSettings: WholesaleSettingsDto = {
  isEnabled: true,
  requireMinTotalUnits: false,
  minTotalUnits: 250,
  requireMinTotalAmount: false,
  minTotalAmountArs: 200000,
}

function buildConfig(settings: Partial<WholesaleSettingsDto> = {}): PublicWholesaleConfig {
  return {
    settings: { ...baseSettings, ...settings },
    priceRules: [
      { id: 'r1', category: 'LETTER', size: '2', unitPriceArs: 881, minUnitsPerColor: 25, isActive: true },
      { id: 'r2', category: 'EMOJI', size: '1', unitPriceArs: 935, minUnitsPerColor: 25, isActive: true },
      { id: 'r3', category: 'COLLAR', size: '1', unitPriceArs: 9200, minUnitsPerColor: 25, isActive: true },
    ],
  }
}

function line(
  overrides: Partial<WholesaleOrderLine> & Pick<WholesaleOrderLine, 'itemKey' | 'quantity'>
): WholesaleOrderLine {
  return { category: 'LETTER', size: '2', colorHex: BLUE, ...overrides }
}

describe('prepareWholesaleOrder', () => {
  it('recalcula totales y arma el snapshot con precios y nombres vigentes', () => {
    const result = prepareWholesaleOrder({
      lines: [
        line({ itemKey: 'B', quantity: 5 }),
        line({ itemKey: 'A', quantity: 20 }),
        { category: 'COLLAR', size: '1', colorHex: BLACK, itemKey: 'plain', quantity: 30 },
      ],
      catalog,
      config: buildConfig(),
    })

    expect(result.isValid).toBe(true)
    if (!result.isValid) return

    expect(result.order.totalUnits).toBe(55)
    expect(result.order.totalAmountArs).toBe(25 * 881 + 30 * 9200)

    const [letterGroup, collarGroup] = result.order.groups
    expect(letterGroup).toMatchObject({
      category: 'LETTER',
      colorName: getElementColorName(BLUE),
      unitPriceArs: 881,
      units: 25,
      subtotalArs: 25 * 881,
    })
    expect(letterGroup.items).toEqual([
      { itemKey: 'A', label: 'A', quantity: 20 },
      { itemKey: 'B', label: 'B', quantity: 5 },
    ])
    expect(collarGroup).toMatchObject({ category: 'COLLAR', colorName: 'Negro', units: 30 })
    expect(collarGroup.items).toEqual([])
  })

  it('usa el label del catálogo para los emojis', () => {
    const result = prepareWholesaleOrder({
      lines: [line({ category: 'EMOJI', size: '1', itemKey: 'heart', quantity: 25 })],
      catalog,
      config: buildConfig(),
    })

    expect(result.isValid).toBe(true)
    if (!result.isValid) return
    expect(result.order.groups[0].items).toEqual([{ itemKey: 'heart', label: 'Corazón', quantity: 25 }])
  })

  it('rechaza el pedido cuando un grupo no alcanza el mínimo por color', () => {
    const result = prepareWholesaleOrder({
      lines: [line({ itemKey: 'A', quantity: 10 })],
      catalog,
      config: buildConfig(),
    })

    expect(result).toEqual({
      isValid: false,
      message: expect.stringContaining('por debajo del mínimo por color'),
    })
  })

  it('rechaza el pedido cuando no se cumple el mínimo de unidades totales', () => {
    const result = prepareWholesaleOrder({
      lines: [line({ itemKey: 'A', quantity: 25 })],
      catalog,
      config: buildConfig({ requireMinTotalUnits: true, minTotalUnits: 250 }),
    })

    expect(result).toEqual({
      isValid: false,
      message: expect.stringContaining('Faltan 225 unidades'),
    })
  })

  it('rechaza el pedido cuando no se cumple el monto mínimo', () => {
    const result = prepareWholesaleOrder({
      lines: [line({ itemKey: 'A', quantity: 25 })],
      catalog,
      config: buildConfig({ requireMinTotalAmount: true, minTotalAmountArs: 200000 }),
    })

    expect(result.isValid).toBe(false)
  })

  it('rechaza líneas cuyo color, ítem o regla no están disponibles', () => {
    const unavailableColor = prepareWholesaleOrder({
      lines: [line({ itemKey: 'A', quantity: 25, colorHex: '#123456' })],
      catalog,
      config: buildConfig(),
    })
    const unavailableItem = prepareWholesaleOrder({
      lines: [line({ itemKey: 'Z', quantity: 25 })],
      catalog,
      config: buildConfig(),
    })
    const emojiWithoutSize = prepareWholesaleOrder({
      lines: [line({ category: 'EMOJI', size: '2', itemKey: 'heart', quantity: 25 })],
      catalog,
      config: buildConfig(),
    })

    for (const result of [unavailableColor, unavailableItem, emojiWithoutSize]) {
      expect(result).toEqual({
        isValid: false,
        message: expect.stringContaining('ya no están disponibles'),
      })
    }
  })

  it('rechaza líneas duplicadas', () => {
    const result = prepareWholesaleOrder({
      lines: [line({ itemKey: 'A', quantity: 15 }), line({ itemKey: 'A', quantity: 15 })],
      catalog,
      config: buildConfig(),
    })

    expect(result).toEqual({ isValid: false, message: expect.stringContaining('repetidos') })
  })

  it('rechaza el pedido cuando la sección está deshabilitada', () => {
    const result = prepareWholesaleOrder({
      lines: [line({ itemKey: 'A', quantity: 25 })],
      catalog,
      config: buildConfig({ isEnabled: false }),
    })

    expect(result).toEqual({
      isValid: false,
      message: expect.stringContaining('no está disponible'),
    })
  })
})
