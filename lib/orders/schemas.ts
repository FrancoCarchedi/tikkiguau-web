import { z } from 'zod'

export const createOrderSchema = z
  .object({
    firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
    lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
    email: z.string().trim().email('Email inválido'),
    phone: z.string().trim().min(8, 'Teléfono inválido'),
    deliveryMethod: z.enum(['PICKUP', 'CORREO_DOMICILIO', 'CORREO_SUCURSAL']),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    zipCode: z.string().trim().optional(),
    orderItems: z.array(z.record(z.string(), z.unknown())).min(1),
    totalAmount: z.number().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === 'CORREO_DOMICILIO') {
      if (!data.address) {
        ctx.addIssue({
          code: 'custom',
          message: 'La dirección es obligatoria',
          path: ['address'],
        })
      }
      if (!data.city) {
        ctx.addIssue({
          code: 'custom',
          message: 'La ciudad es obligatoria',
          path: ['city'],
        })
      }
      if (!data.zipCode) {
        ctx.addIssue({
          code: 'custom',
          message: 'El código postal es obligatorio',
          path: ['zipCode'],
        })
      }
    }

    if (data.deliveryMethod === 'CORREO_SUCURSAL') {
      if (!data.city) {
        ctx.addIssue({
          code: 'custom',
          message: 'La ciudad es obligatoria',
          path: ['city'],
        })
      }
      if (!data.zipCode) {
        ctx.addIssue({
          code: 'custom',
          message: 'El código postal es obligatorio',
          path: ['zipCode'],
        })
      }
    }
  })

export type CreateOrderInput = z.infer<typeof createOrderSchema>
