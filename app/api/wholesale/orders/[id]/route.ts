import { requireAdminSession } from '@/lib/catalog/require-admin'
import { mapWholesaleOrder } from '@/lib/wholesale/order-mappers'
import { updateWholesaleOrderSchema } from '@/lib/wholesale/order-schemas'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession()
  if (error) return error

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Datos inválidos' }, { status: 400 })
  }

  const parsed = updateWholesaleOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  try {
    const existing = await prisma.wholesaleOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 })
    }

    const order = await prisma.wholesaleOrder.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    return NextResponse.json(mapWholesaleOrder(order))
  } catch {
    return NextResponse.json(
      { message: 'No se pudo actualizar el pedido mayorista' },
      { status: 500 }
    )
  }
}
