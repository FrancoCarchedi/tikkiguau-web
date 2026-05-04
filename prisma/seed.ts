import 'dotenv/config'
import { auth } from '../lib/auth'
import { prisma } from '../lib/prisma'
import { env } from '../lib/env'

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = env

if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    '❌ Variables de entorno del seeder faltantes. Asegúrate de definir ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD en tu .env'
  )
}

const ADMIN_USER = {
  name: ADMIN_NAME,
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
}

async function main() {
  console.log('Verificando si el usuario administrador ya existe...')

  const existingUser = await prisma.user.findUnique({
    where: { email: ADMIN_USER.email },
  })

  if (existingUser) {
    console.log(`El usuario administrador ya existe: ${existingUser.email}`)
    return
  }

  console.log('Creando usuario administrador...')

  await auth.api.signUpEmail({
    body: {
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
    },
  })

  console.log(`✓ Usuario administrador creado exitosamente: ${ADMIN_USER.email}`)
}

main()
  .catch((e) => {
    console.error('Error al ejecutar el seeder:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
