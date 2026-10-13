import { z } from 'zod'
import { userDataSchema } from '@/lib/designer/validation'
import {
  MAX_UNITS_PER_ITEM,
  NOTES_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  REFERENCE_MAX_LENGTH,
  REFERENCE_MIN_LENGTH,
} from './constants'
import { sanitizeNotes, sanitizeReference } from './build-whatsapp-message'

export const MAX_LINES_PER_ORDER = 2000

export const WHOLESALE_ORDER_STATUSES = ['NEW', 'CONTACTED', 'CLOSED', 'CANCELLED'] as const

/** Misma regla de teléfono que el flujo minorista: no se redefine para evitar divergencias. */
export const wholesalePhoneSchema = userDataSchema.shape.phone.max(
  PHONE_MAX_LENGTH,
  `Máximo ${PHONE_MAX_LENGTH} caracteres`
)

export const wholesaleReferenceSchema = z
  .string({ error: 'La referencia es obligatoria' })
  .max(REFERENCE_MAX_LENGTH * 2, `Máximo ${REFERENCE_MAX_LENGTH} caracteres`)
  .transform(sanitizeReference)
  .pipe(
    z
      .string()
      .min(REFERENCE_MIN_LENGTH, `Ingresá una referencia de al menos ${REFERENCE_MIN_LENGTH} caracteres`)
  )

const wholesaleNotesSchema = z
  .string({ error: 'Las notas deben ser texto' })
  .max(NOTES_MAX_LENGTH * 2, `Las notas admiten hasta ${NOTES_MAX_LENGTH} caracteres`)
  .transform(sanitizeNotes)

const wholesaleOrderLineSchema = z.object({
  category: z.enum(['LETTER', 'EMOJI', 'COLLAR', 'LEASH'], { error: 'Categoría inválida' }),
  size: z.enum(['1', '2'], { error: 'Talla inválida' }),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
  itemKey: z.string().min(1, 'Ítem inválido').max(50, 'Ítem inválido'),
  quantity: z
    .number({ error: 'La cantidad debe ser un número' })
    .int('La cantidad debe ser un entero')
    .min(1, 'La cantidad debe ser mayor a 0')
    .max(MAX_UNITS_PER_ITEM, `La cantidad máxima por ítem es ${MAX_UNITS_PER_ITEM}`),
})

export const createWholesaleOrderSchema = z.object({
  reference: wholesaleReferenceSchema,
  phone: wholesalePhoneSchema,
  notes: wholesaleNotesSchema.default(''),
  lines: z
    .array(wholesaleOrderLineSchema)
    .min(1, 'Agregá al menos una unidad a tu pedido')
    .max(MAX_LINES_PER_ORDER, 'El pedido tiene demasiados ítems'),
})

export const updateWholesaleOrderSchema = z.object({
  status: z.enum(WHOLESALE_ORDER_STATUSES, { error: 'Estado inválido' }),
})

export type CreateWholesaleOrderInput = z.infer<typeof createWholesaleOrderSchema>
export type UpdateWholesaleOrderInput = z.infer<typeof updateWholesaleOrderSchema>
