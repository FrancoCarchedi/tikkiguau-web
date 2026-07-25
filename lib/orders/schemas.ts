import { z } from 'zod'

export const createOrderSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'El nombre es obligatorio')
      .max(60, 'Máximo 60 caracteres')
      .regex(/^[\p{L}\p{M}'’\-\s]+$/u, 'Nombre inválido'),
    lastName: z
      .string()
      .trim()
      .min(2, 'El apellido es obligatorio')
      .max(60, 'Máximo 60 caracteres')
      .regex(/^[\p{L}\p{M}'’\-\s]+$/u, 'Apellido inválido'),
    email: z.string().trim().email('Email inválido').max(120),
    phone: z
      .string()
      .trim()
      .refine(
        (value) => /^[+\d\s().-]+$/.test(value),
        'Teléfono inválido'
      )
      .refine((value) => {
        const digits = value.replace(/\D/g, '').length
        return digits >= 8 && digits <= 15
      }, 'Teléfono inválido'),
    deliveryMethod: z.enum(['PICKUP', 'CORREO_DOMICILIO', 'CORREO_SUCURSAL']),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    zipCode: z.string().trim().optional(),
    orderItems: z.array(z.record(z.string(), z.unknown())).min(1),
    totalAmount: z.number().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === 'CORREO_DOMICILIO') {
      if (!data.address || data.address.length < 5) {
        ctx.addIssue({
          code: 'custom',
          message: 'La dirección es obligatoria',
          path: ['address'],
        })
      }
      if (!data.city || data.city.length < 2) {
        ctx.addIssue({
          code: 'custom',
          message: 'La ciudad es obligatoria',
          path: ['city'],
        })
      }
      if (!data.zipCode || !/^[A-Za-z0-9\s-]{4,12}$/.test(data.zipCode)) {
        ctx.addIssue({
          code: 'custom',
          message: 'El código postal es obligatorio',
          path: ['zipCode'],
        })
      }
    }

    if (data.deliveryMethod === 'CORREO_SUCURSAL') {
      if (!data.address || data.address.length < 5) {
        ctx.addIssue({
          code: 'custom',
          message: 'La dirección de sucursal es obligatoria',
          path: ['address'],
        })
      }
      if (!data.city || data.city.length < 2) {
        ctx.addIssue({
          code: 'custom',
          message: 'La ciudad es obligatoria',
          path: ['city'],
        })
      }
      if (!data.zipCode || !/^[A-Za-z0-9\s-]{4,12}$/.test(data.zipCode)) {
        ctx.addIssue({
          code: 'custom',
          message: 'El código postal es obligatorio',
          path: ['zipCode'],
        })
      }
    }
  })

export type CreateOrderInput = z.infer<typeof createOrderSchema>
