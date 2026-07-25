import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  mapOrderToEmailPayload,
  sendCustomerEmailForCurrentStatus,
} from '@/lib/email/send-order-emails'
import { headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(
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

  const result = await sendCustomerEmailForCurrentStatus(
    mapOrderToEmailPayload(order)
  )

  if (!result.ok) {
    return NextResponse.json(
      { message: result.error || 'No se pudo reenviar el email' },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
