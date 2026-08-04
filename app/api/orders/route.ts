import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createOrderSchema } from '@/lib/orders/schemas'
import {
  OrderPricingMismatchError,
  recalculateOrderTotals,
} from '@/lib/orders/recalculate-order-totals'
import { createCheckoutPreference } from '@/lib/mercadopago/client'
import { isMercadoPagoCheckoutEnabled } from '@/lib/env'
import {
  mapOrderToEmailPayload,
  sendReservationEmails,
} from '@/lib/email/send-order-emails'
import type { Prisma } from '@/app/generated/prisma/client'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      store: {
        select: { id: true, name: true, keyword: true },
      },
    },
  })

  return NextResponse.json(orders)
}

async function generateOrderNumber(): Promise<string> {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  })

  let nextNumber = 1001
  if (lastOrder?.orderNumber) {
    const match = lastOrder.orderNumber.match(/TK-(\d+)/)
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  return `TK-${nextNumber}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      )
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      dni,
      deliveryMethod,
      address,
      city,
      province,
      zipCode,
      orderItems,
      totalAmount: clientTotalAmount,
      paymentMethod,
    } = parsed.data

    if (paymentMethod === 'MERCADOPAGO' && !isMercadoPagoCheckoutEnabled()) {
      return NextResponse.json(
        { message: 'Mercado Pago no está disponible en este momento' },
        { status: 400 }
      )
    }

    let totals
    try {
      totals = await recalculateOrderTotals({
        orderItems,
        deliveryMethod,
        paymentMethod,
      })
    } catch (error) {
      if (error instanceof OrderPricingMismatchError) {
        return NextResponse.json({ message: error.message }, { status: 400 })
      }
      throw error
    }

    if (Math.round(clientTotalAmount) !== totals.totalAmount) {
      return NextResponse.json(
        {
          message:
            'El total no coincide con el calculado en el servidor. Actualizá la página e intentá de nuevo.',
        },
        { status: 400 }
      )
    }

    const orderNumber = await generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        firstName,
        lastName,
        email,
        phone,
        dni,
        deliveryMethod,
        address: address ?? null,
        city: city ?? null,
        province: province ?? null,
        zipCode: zipCode ?? null,
        totalAmount: totals.totalAmount,
        orderItems: orderItems as Prisma.InputJsonValue,
        storeId: null,
        paymentMethod,
        paymentStatus:
          paymentMethod === 'MERCADOPAGO' ? 'PENDING' : 'NOT_REQUIRED',
        paymentSurchargeAmount: totals.paymentSurchargeAmount,
      },
    })

    let preferenceId: string | undefined

    if (paymentMethod === 'MERCADOPAGO') {
      try {
        const preference = await createCheckoutPreference({
          orderNumber: order.orderNumber,
          title: `Pedido TikkiGuau ${order.orderNumber}`,
          totalAmount: totals.totalAmount,
          payerEmail: email,
        })
        preferenceId = preference.preferenceId
        await prisma.order.update({
          where: { id: order.id },
          data: { mpPreferenceId: preferenceId },
        })
      } catch (error) {
        console.error('[mercadopago] Error creando preferencia:', error)
        await prisma.order.delete({ where: { id: order.id } })
        return NextResponse.json(
          {
            message:
              'No se pudo iniciar el pago con Mercado Pago. Intentá de nuevo o elegí transferencia.',
          },
          { status: 502 }
        )
      }
    }

    await sendReservationEmails(mapOrderToEmailPayload(order))

    return NextResponse.json(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        preferenceId: preferenceId ?? null,
        paymentMethod: order.paymentMethod,
        totalAmount: totals.totalAmount,
        paymentSurchargeAmount: totals.paymentSurchargeAmount,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ message: 'Error al crear la orden' }, { status: 500 })
  }
}
