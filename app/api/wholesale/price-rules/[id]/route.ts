import { requireAdminSession } from '@/lib/catalog/require-admin'
import { mapWholesalePriceRule } from '@/lib/wholesale/mappers'
import { updateWholesalePriceRuleSchema } from '@/lib/wholesale/schemas'
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

  const parsed = updateWholesalePriceRuleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  try {
    const existing = await prisma.wholesalePriceRule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Regla no encontrada' }, { status: 404 })
    }

    const rule = await prisma.wholesalePriceRule.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(mapWholesalePriceRule(rule))
  } catch {
    return NextResponse.json(
      { message: 'No se pudo actualizar la regla mayorista' },
      { status: 500 }
    )
  }
}
