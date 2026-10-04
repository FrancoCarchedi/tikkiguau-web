import { z } from 'zod'
import type { WholesaleSettingsDto } from '@/types/wholesale'

export const updateWholesalePriceRuleSchema = z.object({
  unitPriceArs: z
    .number({ error: 'El precio debe ser un número' })
    .int('El precio debe ser un entero')
    .positive('El precio debe ser mayor a 0')
    .optional(),
  minUnitsPerColor: z
    .number({ error: 'El mínimo debe ser un número' })
    .int('El mínimo debe ser un entero')
    .min(0, 'El mínimo no puede ser negativo')
    .optional(),
  isActive: z.boolean().optional(),
})

const positiveIntegerSchema = (message: string) =>
  z.number({ error: message }).int(message).positive(message)

export const wholesaleSettingsSchema = z
  .object({
    isEnabled: z.boolean(),
    requireMinTotalUnits: z.boolean(),
    minTotalUnits: positiveIntegerSchema('Las unidades mínimas deben ser un entero mayor a 0'),
    requireMinTotalAmount: z.boolean(),
    minTotalAmountArs: positiveIntegerSchema('El monto mínimo debe ser un entero mayor a 0'),
  })
  .strict()

export const updateWholesaleSettingsSchema = wholesaleSettingsSchema.partial()

/** Formulario del CMS: todas las reglas editables a la vez. */
export const wholesalePriceRulesFormSchema = z.object({
  rules: z.array(
    z.object({
      id: z.string().min(1),
      unitPriceArs: z
        .number({ error: 'Ingresá un precio' })
        .int('El precio debe ser un entero')
        .positive('El precio debe ser mayor a 0'),
      minUnitsPerColor: z
        .number({ error: 'Ingresá un mínimo' })
        .int('El mínimo debe ser un entero')
        .min(0, 'El mínimo no puede ser negativo'),
      isActive: z.boolean(),
    })
  ),
})

export type WholesalePriceRulesFormValues = z.infer<typeof wholesalePriceRulesFormSchema>

export type UpdateWholesalePriceRuleInput = z.infer<typeof updateWholesalePriceRuleSchema>
export type UpdateWholesaleSettingsInput = z.infer<typeof updateWholesaleSettingsSchema>

/** Valida el estado resultante de fusionar el PATCH con los ajustes actuales. */
export function mergeAndValidateSettings(
  current: WholesaleSettingsDto,
  patch: UpdateWholesaleSettingsInput
) {
  return wholesaleSettingsSchema.safeParse({ ...current, ...patch })
}
