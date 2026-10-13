import { requireAdminSession } from '@/lib/catalog/require-admin'
import { createWholesaleOrder } from '@/lib/wholesale/create-wholesale-order'
import { mapWholesaleOrder } from '@/lib/wholesale/order-mappers'
import { createWholesaleOrderSchema } from '@/lib/wholesale/order-schemas'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const orders = await prisma.wholesaleOrder.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(orders.map(mapWholesaleOrder))
  } catch {
    return NextResponse.json(
      { message: 'No se pudieron cargar los pedidos mayoristas' },
      { status: 500 }
    )
  }
}

/** Público: no requiere sesión. Todo el contenido se valida y recalcula en el servidor. */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Datos inválidos' }, { status: 400 })
  }

  const parsed = createWholesaleOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  try {
    const outcome = await createWholesaleOrder(parsed.data)

    if (!outcome.isCreated) {
      return NextResponse.json({ message: outcome.message }, { status: 400 })
    }

    return NextResponse.json(outcome.order, { status: 201 })
  } catch (error) {
    console.error('[wholesale] Error al crear el pedido mayorista:', error)
    return NextResponse.json(
      { message: 'No pudimos registrar tu pedido. Intentá de nuevo en unos minutos.' },
      { status: 500 }
    )
  }
}
