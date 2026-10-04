import { describe, expect, it } from 'vitest'
import type {
  PublicWholesaleConfig,
  WholesaleOrderLine,
  WholesalePriceRuleDto,
  WholesaleSettingsDto,
} from '@/types/wholesale'
import { evaluateWholesaleOrder, sortWholesaleLines } from './order-calculator'

const BLUE = '#0041B9'
const RED = '#E0374E'

const priceRules: WholesalePriceRuleDto[] = [
  { id: 'r1', category: 'LETTER', size: '2', unitPriceArs: 881, minUnitsPerColor: 25, isActive: true },
  { id: 'r2', category: 'LETTER', size: '1', unitPriceArs: 821, minUnitsPerColor: 25, isActive: true },
  { id: 'r3', category: 'EMOJI', size: '1', unitPriceArs: 935, minUnitsPerColor: 25, isActive: true },
  { id: 'r4', category: 'COLLAR', size: '1', unitPriceArs: 9200, minUnitsPerColor: 0, isActive: true },
]

const baseSettings: WholesaleSettingsDto = {
  isEnabled: true,
  requireMinTotalUnits: false,
  minTotalUnits: 250,
  requireMinTotalAmount: false,
  minTotalAmountArs: 200000,
}

function buildConfig(settings: Partial<WholesaleSettingsDto> = {}): PublicWholesaleConfig {
  return { settings: { ...baseSettings, ...settings }, priceRules }
}

function line(
  overrides: Partial<WholesaleOrderLine> & Pick<WholesaleOrderLine, 'itemKey' | 'quantity'>
): WholesaleOrderLine {
  return { category: 'LETTER', size: '2', colorHex: BLUE, ...overrides }
}

describe('evaluateWholesaleOrder', () => {
  it('suma las unidades de todos los ítems del mismo grupo categoría + talla + color', () => {
    const evaluation = evaluateWholesaleOrder(
      [
        line({ itemKey: 'A', quantity: 10 }),
        line({ itemKey: 'B', quantity: 10 }),
        line({ itemKey: 'C', quantity: 5 }),
      ],
      buildConfig()
    )

    expect(evaluation.groups).toHaveLength(1)
    expect(evaluation.groups[0]).toMatchObject({ units: 25, missingUnits: 0, subtotalArs: 22025 })
    expect(evaluation.isValid).toBe(true)
  })

  it('marca incumplido un color bajo el mínimo e indica las unidades faltantes', () => {
    const evaluation = evaluateWholesaleOrder(
      [line({ itemKey: 'A', quantity: 10, colorHex: RED })],
      buildConfig()
    )

    expect(evaluation.groups[0].missingUnits).toBe(15)
    expect(evaluation.isValid).toBe(false)
    expect(evaluation.blockingReasons).toContain('Hay 1 color por debajo del mínimo por color')
  })

  it('evalúa por separado cada talla del mismo color', () => {
    const evaluation = evaluateWholesaleOrder(
      [
        line({ itemKey: 'A', quantity: 20, size: '2' }),
        line({ itemKey: 'A', quantity: 20, size: '1' }),
      ],
      buildConfig()
    )

    expect(evaluation.groups).toHaveLength(2)
    expect(evaluation.groups.every((group) => group.missingUnits === 5)).toBe(true)
  })

  it('no exige mínimo por color cuando es 0', () => {
    const evaluation = evaluateWholesaleOrder(
      [line({ category: 'COLLAR', size: '1', itemKey: 'plain', quantity: 3 })],
      buildConfig()
    )

    expect(evaluation.groups[0].missingUnits).toBe(0)
    expect(evaluation.isValid).toBe(true)
  })

  it('calcula el total estimado con precios distintos por categoría y talla', () => {
    const evaluation = evaluateWholesaleOrder(
      [
        line({ itemKey: 'A', quantity: 30 }),
        line({ category: 'EMOJI', size: '1', itemKey: 'corazon', quantity: 25 }),
      ],
      buildConfig()
    )

    expect(evaluation.totalUnits).toBe(55)
    expect(evaluation.totalAmountArs).toBe(30 * 881 + 25 * 935)
  })

  it('exige al menos una unidad cuando no hay requisitos activos', () => {
    const evaluation = evaluateWholesaleOrder([], buildConfig())

    expect(evaluation.isValid).toBe(false)
    expect(evaluation.unitsRequirement).toBeNull()
    expect(evaluation.amountRequirement).toBeNull()
  })

  it('valida solo el mínimo de unidades cuando solo ese requisito está activo', () => {
    const config = buildConfig({ requireMinTotalUnits: true, minTotalUnits: 100 })
    const evaluation = evaluateWholesaleOrder([line({ itemKey: 'A', quantity: 30 })], config)

    expect(evaluation.unitsRequirement).toMatchObject({ missing: 70, isMet: false })
    expect(evaluation.amountRequirement).toBeNull()
    expect(evaluation.isValid).toBe(false)
  })

  it('valida solo el monto mínimo cuando solo ese requisito está activo', () => {
    const config = buildConfig({ requireMinTotalAmount: true, minTotalAmountArs: 30000 })
    const evaluation = evaluateWholesaleOrder([line({ itemKey: 'A', quantity: 30 })], config)

    expect(evaluation.unitsRequirement).toBeNull()
    expect(evaluation.amountRequirement).toMatchObject({ missing: 30000 - 26430, isMet: false })
    expect(evaluation.isValid).toBe(false)
  })

  it('exige ambos requisitos cuando los dos están activos', () => {
    const config = buildConfig({
      requireMinTotalUnits: true,
      minTotalUnits: 30,
      requireMinTotalAmount: true,
      minTotalAmountArs: 30000,
    })

    const onlyUnitsMet = evaluateWholesaleOrder([line({ itemKey: 'A', quantity: 30 })], config)
    expect(onlyUnitsMet.unitsRequirement?.isMet).toBe(true)
    expect(onlyUnitsMet.amountRequirement?.isMet).toBe(false)
    expect(onlyUnitsMet.isValid).toBe(false)

    const bothMet = evaluateWholesaleOrder([line({ itemKey: 'A', quantity: 35 })], config)
    expect(bothMet.isValid).toBe(true)
  })

  it('ignora líneas sin regla activa o con cantidad inválida', () => {
    const evaluation = evaluateWholesaleOrder(
      [
        line({ category: 'LEASH', itemKey: 'plain', quantity: 50 }),
        line({ itemKey: 'A', quantity: 0 }),
        line({ itemKey: 'B', quantity: -3 }),
        line({ itemKey: 'C', quantity: Number.NaN }),
      ],
      buildConfig()
    )

    expect(evaluation.totalUnits).toBe(0)
    expect(evaluation.groups).toHaveLength(0)
  })
})

describe('sortWholesaleLines', () => {
  it('ordena por categoría, talla (mediana primero), color e ítem', () => {
    const lines = [
      line({ category: 'EMOJI', size: '1', itemKey: 'corazon', quantity: 1 }),
      line({ itemKey: 'B', quantity: 1, size: '1' }),
      line({ itemKey: 'C', quantity: 1, size: '2' }),
      line({ itemKey: 'A', quantity: 1, size: '2' }),
    ]

    const sorted = sortWholesaleLines(lines, {
      colorIndex: () => 0,
      itemIndex: (_category, itemKey) => itemKey.charCodeAt(0),
    })

    expect(sorted.map((entry) => `${entry.category}:${entry.size}:${entry.itemKey}`)).toEqual([
      'LETTER:2:A',
      'LETTER:2:C',
      'LETTER:1:B',
      'EMOJI:1:corazon',
    ])
  })
})
