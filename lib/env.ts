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
