import { describe, expect, it } from 'vitest'
import type { WholesaleSettingsDto } from '@/types/wholesale'
import {
  mergeAndValidateSettings,
  updateWholesalePriceRuleSchema,
  updateWholesaleSettingsSchema,
} from './schemas'

const currentSettings: WholesaleSettingsDto = {
  isEnabled: true,
  requireMinTotalUnits: true,
  minTotalUnits: 250,
  requireMinTotalAmount: false,
  minTotalAmountArs: 200000,
}

describe('updateWholesalePriceRuleSchema', () => {
  it('acepta precio entero positivo y mínimo 0', () => {
    expect(updateWholesalePriceRuleSchema.safeParse({ unitPriceArs: 950, minUnitsPerColor: 0 }).success).toBe(true)
  })

  it.each([0, -5, 10.5])('rechaza el precio %s', (unitPriceArs) => {
    expect(updateWholesalePriceRuleSchema.safeParse({ unitPriceArs }).success).toBe(false)
  })

  it('rechaza un mínimo por color negativo o decimal', () => {
    expect(updateWholesalePriceRuleSchema.safeParse({ minUnitsPerColor: -1 }).success).toBe(false)
    expect(updateWholesalePriceRuleSchema.safeParse({ minUnitsPerColor: 2.5 }).success).toBe(false)
  })
})

describe('ajustes del pedido', () => {
  it('conserva el valor previo al reactivar un requisito sin enviarlo', () => {
    const patch = updateWholesaleSettingsSchema.parse({ requireMinTotalAmount: true })
    const result = mergeAndValidateSettings(currentSettings, patch)

    expect(result.success).toBe(true)
    expect(result.success && result.data.minTotalAmountArs).toBe(200000)
  })

  it('rechaza un valor inválido en el estado resultante', () => {
    const patch = updateWholesaleSettingsSchema.parse({ minTotalUnits: 10 })
    expect(mergeAndValidateSettings(currentSettings, patch).success).toBe(true)

    expect(updateWholesaleSettingsSchema.safeParse({ minTotalUnits: 0 }).success).toBe(false)
    expect(updateWholesaleSettingsSchema.safeParse({ minTotalAmountArs: -10 }).success).toBe(false)
  })

  it('rechaza campos desconocidos', () => {
    expect(updateWholesaleSettingsSchema.safeParse({ hack: true }).success).toBe(false)
  })
})
