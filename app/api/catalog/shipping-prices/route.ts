import { mapShippingPrice } from '@/lib/catalog/mappers'
import { requireAdminSession } from '@/lib/catalog/require-admin'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  const prices = await prisma.shippingPrice.findMany({
    orderBy: { deliveryMethod: 'asc' },
  })

  return NextResponse.json(prices.map(mapShippingPrice))
}
