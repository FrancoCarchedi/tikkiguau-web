import { mapElementColor } from '@/lib/catalog/mappers'
import { requireAdminSession } from '@/lib/catalog/require-admin'
import { updateElementColorSchema } from '@/lib/catalog/schemas'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const parsed = updateElementColorSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  if (parsed.data.hexValue) {
    const existing = await prisma.catalogElementColor.findFirst({
      where: { hexValue: parsed.data.hexValue, NOT: { id } },
    })
    if (existing) {
      return NextResponse.json(
        { message: 'Ya existe un color de elemento con ese valor hexadecimal' },
        { status: 409 }
      )
    }
  }

  const color = await prisma.catalogElementColor.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(mapElementColor(color))
}
