import { Prisma } from '@/app/generated/prisma/client'
import { getPublicCatalog } from '@/lib/catalog/get-public-catalog'
import { prisma } from '@/lib/prisma'
import type { CreateWholesaleOrderResult } from '@/types/wholesale'
import type { CreateWholesaleOrderInput } from './order-schemas'
import { prepareWholesaleOrder } from './prepare-wholesale-order'
import { getPublicWholesaleConfig } from './wholesale-queries'

const ORDER_NUMBER_PREFIX = 'WH-'
const FIRST_ORDER_NUMBER = 1001
const MAX_ORDER_NUMBER_ATTEMPTS = 5
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002'

export type CreateWholesaleOrderOutcome =
  | { isCreated: true; order: CreateWholesaleOrderResult }
  | { isCreated: false; message: string }

async function buildNextOrderNumber(): Promise<string> {
  const lastOrder = await prisma.wholesaleOrder.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  })

  const lastNumber = Number(lastOrder?.orderNumber.replace(ORDER_NUMBER_PREFIX, ''))
  const nextNumber = Number.isInteger(lastNumber) ? lastNumber + 1 : FIRST_ORDER_NUMBER

  return `${ORDER_NUMBER_PREFIX}${nextNumber}`
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  )
}

/**
 * Valida el pedido contra la configuración y el catálogo vigentes y lo guarda con un
 * snapshot de precios y nombres. Los errores de base de datos se propagan al llamador.
 */
export async function createWholesaleOrder(
  input: CreateWholesaleOrderInput
): Promise<CreateWholesaleOrderOutcome> {
  const [catalog, config] = await Promise.all([getPublicCatalog(), getPublicWholesaleConfig()])

  const prepared = prepareWholesaleOrder({ lines: input.lines, catalog, config })
  if (!prepared.isValid) {
    return { isCreated: false, message: prepared.message }
  }

  for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
    try {
      const order = await prisma.wholesaleOrder.create({
        data: {
          orderNumber: await buildNextOrderNumber(),
          reference: input.reference,
          phone: input.phone,
          notes: input.notes || null,
          totalUnits: prepared.order.totalUnits,
          totalAmountArs: prepared.order.totalAmountArs,
          items: prepared.order.groups as unknown as Prisma.InputJsonValue,
        },
        select: { id: true, orderNumber: true },
      })

      return { isCreated: true, order }
    } catch (error) {
      // Dos pedidos simultáneos pueden calcular el mismo número: se recalcula y se reintenta.
      if (!isUniqueConstraintViolation(error) || attempt === MAX_ORDER_NUMBER_ATTEMPTS) {
        throw error
      }
    }
  }

  throw new Error('No se pudo asignar un número de pedido mayorista')
}
