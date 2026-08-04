import { z } from 'zod'
import type { DeliveryData, UserData } from '@/types/collar'

const namePattern = /^[\p{L}\p{M}'’\-\s]+$/u

function countDigits(value: string): number {
  return value.replace(/\D/g, '').length
}

function normalizeDniDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export const userDataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresá al menos 2 caracteres')
    .max(60, 'Máximo 60 caracteres')
    .regex(namePattern, 'Usá solo letras, espacios o guiones'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Ingresá al menos 2 caracteres')
    .max(60, 'Máximo 60 caracteres')
    .regex(namePattern, 'Usá solo letras, espacios o guiones'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .email('Ingresá un email válido')
    .max(120, 'Máximo 120 caracteres'),
  phone: z
    .string()
    .trim()
    .min(1, 'El teléfono es obligatorio')
    .refine(
      (value) => /^[+\d\s().-]+$/.test(value),
      'Usá solo números y símbolos telefónicos (+, -, espacios)'
    )
    .refine((value) => {
      const digits = countDigits(value)
      return digits >= 8 && digits <= 15
    }, 'Ingresá un teléfono válido (8 a 15 dígitos)'),
  dni: z
    .string()
    .trim()
    .min(1, 'El DNI es obligatorio')
    .refine((value) => {
      const digits = normalizeDniDigits(value)
      return digits.length >= 7 && digits.length <= 8
    }, 'Ingresá un DNI válido (7 u 8 dígitos)'),
})

export type UserDataField = keyof UserData

export function validateUserData(data: UserData) {
  return userDataSchema.safeParse(data)
}

export function getUserDataFieldErrors(
  data: UserData
): Partial<Record<UserDataField, string>> {
  const result = userDataSchema.safeParse(data)
  if (result.success) return {}

  const errors: Partial<Record<UserDataField, string>> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (
      (key === 'name' ||
        key === 'lastName' ||
        key === 'email' ||
        key === 'phone' ||
        key === 'dni') &&
      !errors[key]
    ) {
      errors[key] = issue.message
    }
  }
  return errors
}

const optionalTrimmed = z.string().trim().optional()

export const deliveryDataSchema = z
  .object({
    method: z.enum(['PICKUP', 'CORREO_DOMICILIO', 'CORREO_SUCURSAL']),
    address: optionalTrimmed,
    city: optionalTrimmed,
    province: optionalTrimmed,
    postalCode: optionalTrimmed,
    branchPreference: optionalTrimmed,
  })
  .superRefine((data, ctx) => {
    if (data.method === 'CORREO_DOMICILIO') {
      if (!data.address || data.address.length < 5) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ingresá calle, altura y piso/depto si corresponde',
          path: ['address'],
        })
      }
      if (!data.province || data.province.length < 2) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ingresá la provincia',
          path: ['province'],
        })
      }
      if (!data.city || data.city.length < 2) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ingresá la localidad',
          path: ['city'],
        })
      }
      if (!data.postalCode || !/^[A-Za-z0-9\s-]{4,12}$/.test(data.postalCode)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ingresá un código postal válido',
          path: ['postalCode'],
        })
      }
    }

    if (data.method === 'CORREO_SUCURSAL') {
      if (!data.branchPreference || data.branchPreference.length < 5) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ingresá el nombre y la calle de la sucursal',
          path: ['branchPreference'],
        })
      }
      if (!data.province || data.province.length < 2) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ingresá la provincia',
          path: ['province'],
        })
      }
    }
  })

export type DeliveryDataField = keyof DeliveryData

export function validateDeliveryData(data: DeliveryData) {
  return deliveryDataSchema.safeParse(data)
}

export function getDeliveryDataFieldErrors(
  data: DeliveryData
): Partial<Record<DeliveryDataField, string>> {
  const result = deliveryDataSchema.safeParse(data)
  if (result.success) return {}

  const errors: Partial<Record<DeliveryDataField, string>> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (
      typeof key === 'string' &&
      (key === 'address' ||
        key === 'city' ||
        key === 'province' ||
        key === 'postalCode' ||
        key === 'branchPreference' ||
        key === 'method') &&
      !errors[key as DeliveryDataField]
    ) {
      errors[key as DeliveryDataField] = issue.message
    }
  }
  return errors
}
