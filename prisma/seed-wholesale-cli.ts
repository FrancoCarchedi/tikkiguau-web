import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { seedWholesale } from './seed-wholesale'

function describeTargetDatabase(): string {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return 'DATABASE_URL no definida'

  const { hostname, pathname } = new URL(databaseUrl)
  return `${hostname}${pathname}`
}

async function main() {
  console.log(`Base de datos destino: ${describeTargetDatabase()}`)
  await seedWholesale(prisma)
}

main()
  .catch((error) => {
    console.error('Error al sembrar las reglas mayoristas:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
