import { z } from 'zod'

export const signInSchema = z.object({
  email: z
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string('La contraseña es requerida')
    .min(1, 'La contraseña es requerida'),
})

export type SignInFormValues = z.infer<typeof signInSchema>
