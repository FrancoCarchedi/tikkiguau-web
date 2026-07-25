import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  isAutoEmailTransition,
  mapOrderToEmailPayload,
  sendStatusEmail,
} from '@/lib/email/send-order-emails'
import type { OrderStatus } from '@/emails/types'
import { headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id } })

  if (!order) {
    return NextResponse.json({ message: 'Orden no encontrada' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.order.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ message: 'Orden no encontrada' }, { status: 404 })
  }

  const allowedFields = ['status', 'trackingCode']
  const updateData: Record<string, unknown> = {}

  for (const field of allowedFields) {
    if (field in body) updateData[field] = body[field]
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { message: 'No hay campos válidos para actualizar' },
      { status: 400 }
    )
  }

  const previousStatus = existing.status as OrderStatus
  const nextStatus =
    typeof updateData.status === 'string'
      ? (updateData.status as OrderStatus)
      : previousStatus

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
  })

  if (
    typeof updateData.status === 'string' &&
    isAutoEmailTransition(previousStatus, nextStatus)
  ) {
    await sendStatusEmail(mapOrderToEmailPayload(order))
  }

  return NextResponse.json(order)
}
