import { z } from 'zod'
import { isValidSvgMarkup, sanitizeSvgMarkup } from './sanitize-svg'

const hexColorSchema = z  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe estar en formato #RRGGBB')

export const createBaseColorSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  hexValue: hexColorSchema,
  sortOrder: z.number().int().min(0).optional(),
})

export const updateBaseColorSchema = z.object({
  name: z.string().trim().min(1).optional(),
  hexValue: hexColorSchema.optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const createElementColorSchema = z.object({
  hexValue: hexColorSchema,
  sortOrder: z.number().int().min(0).optional(),
})

export const updateElementColorSchema = z.object({
  hexValue: hexColorSchema.optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const updateLetterSchema = z.object({
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  colorIds: z.array(z.string().min(1)).optional(),
})

const emojiKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'La clave debe ser un slug en minúsculas')

const catalogSizeSchema = z.enum(['1', '2'])

const availableSizesSchema = z
  .array(catalogSizeSchema)
  .min(1, 'Seleccioná al menos una talla')
  .refine(
    (sizes) => new Set(sizes).size === sizes.length,
    'Las tallas no pueden repetirse'
  )

export const createEmojiSchema = z.object({
  key: emojiKeySchema,
  label: z.string().trim().min(1, 'La etiqueta es obligatoria'),
  svgMarkup: z
    .string()
    .min(1, 'El SVG es obligatorio')
    .refine(isValidSvgMarkup, 'El SVG no es válido o contiene contenido no permitido'),
  sortOrder: z.number().int().min(0).optional(),
  colorIds: z.array(z.string().min(1)).optional(),
  availableSizes: availableSizesSchema.optional(),
})

export const updateEmojiSchema = z.object({
  key: emojiKeySchema.optional(),
  label: z.string().trim().min(1).optional(),
  svgMarkup: z
    .string()
    .min(1)
    .refine(isValidSvgMarkup, 'El SVG no es válido o contiene contenido no permitido')
    .optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  colorIds: z.array(z.string().min(1)).optional(),
  availableSizes: availableSizesSchema.optional(),
})

export const updateProductPriceSchema = z.object({
  amountArs: z.number().int().positive('El precio debe ser mayor a 0').optional(),
  label: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  pieces: z.number().int().positive().optional(),
})

export const updateShippingPriceSchema = z.object({
  amountArs: z.number().int().min(0, 'El costo no puede ser negativo'),
})

export function parseSvgMarkup(raw: string): string {  const sanitized = sanitizeSvgMarkup(raw)
  if (!sanitized) {
    throw new Error('SVG inválido')
  }
  return sanitized
}
