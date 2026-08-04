import { z } from 'zod'

const envSchema = z.object({
  // Base de datos
  DATABASE_URL: z
    .url('DATABASE_URL debe ser una URL válida')
    .startsWith('postgresql://', 'DATABASE_URL debe comenzar con postgresql://'),

  // Better Auth
  BETTER_AUTH_SECRET: z
    .string('BETTER_AUTH_SECRET es requerida')
    .min(16, 'BETTER_AUTH_SECRET debe tener al menos 16 caracteres'),
  BETTER_AUTH_URL: z
    .url('BETTER_AUTH_URL debe ser una URL válida'),

  // Emails transaccionales (Resend) — opcionales en build; requeridos al enviar
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  ORDER_NOTIFY_EMAIL: z.email().optional(),

  // Mercado Pago (opcionales en build; requeridos al cobrar online)
  MP_ACCESS_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_MP_PUBLIC_KEY: z.string().min(1).optional(),
  /** Base pública HTTPS (ngrok en test / dominio en prod) para back_urls y notification_url */
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  MP_WEBHOOK_SECRET: z.string().min(1).optional(),
  /** Si es "false", oculta Mercado Pago en el diseñador (también en cliente vía NEXT_PUBLIC_) */
  MP_CHECKOUT_ENABLED: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_MP_CHECKOUT_ENABLED: z.enum(['true', 'false']).optional(),

  // Usuario administrador (solo requeridas en tiempo de ejecución del seeder)
  ADMIN_NAME: z
    .string('ADMIN_NAME es requerida')
    .min(1, 'ADMIN_NAME no puede estar vacío')
    .optional(),
  ADMIN_EMAIL: z
    .email('ADMIN_EMAIL debe ser un correo electrónico válido')
    .optional(),
  ADMIN_PASSWORD: z
    .string('ADMIN_PASSWORD es requerida')
    .min(8, 'ADMIN_PASSWORD debe tener al menos 8 caracteres')
    .optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const { fieldErrors } = parsed.error.flatten()
  const errorMessages = Object.entries(fieldErrors)
    .map(([field, errors]) => `  • ${field}: ${errors?.join(', ')}`)
    .join('\n')

  throw new Error(
    `❌ Variables de entorno inválidas o faltantes:\n${errorMessages}\n\nVerifica tu archivo .env`
  )
}

export const env = parsed.data

export function isMercadoPagoCheckoutEnabled(): boolean {
  if (
    env.MP_CHECKOUT_ENABLED === 'false' ||
    env.NEXT_PUBLIC_MP_CHECKOUT_ENABLED === 'false'
  ) {
    return false
  }
  return Boolean(env.MP_ACCESS_TOKEN && env.NEXT_PUBLIC_MP_PUBLIC_KEY)
}
