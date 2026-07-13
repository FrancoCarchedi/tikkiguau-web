import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createOrderSchema } from '@/lib/orders/schemas'
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
      deliveryMethod,
      address,
      city,
      zipCode,
      orderItems,
      totalAmount,
    } = parsed.data

    const orderNumber = await generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        firstName,
        lastName,
        email,
        phone,
        deliveryMethod,
        address: address ?? null,
        city: city ?? null,
        zipCode: zipCode ?? null,
        totalAmount,
        orderItems: orderItems as Prisma.InputJsonValue,
        storeId: null,
      },
    })

    return NextResponse.json(
      { id: order.id, orderNumber: order.orderNumber },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ message: 'Error al crear la orden' }, { status: 500 })
  }
}
