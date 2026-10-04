import { requireAdminSession } from '@/lib/catalog/require-admin'
import { mapWholesalePriceRule } from '@/lib/wholesale/mappers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const rules = await prisma.wholesalePriceRule.findMany({
      orderBy: [{ category: 'asc' }, { size: 'desc' }],
    })

    return NextResponse.json(rules.map(mapWholesalePriceRule))
  } catch {
    return NextResponse.json(
      { message: 'No se pudieron cargar las reglas mayoristas' },
      { status: 500 }
    )
  }
}
