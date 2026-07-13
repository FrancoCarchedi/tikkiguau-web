import { mapElementColor } from '@/lib/catalog/mappers'
import { requireAdminSession } from '@/lib/catalog/require-admin'
import {
  createElementColorSchema,
  updateElementColorSchema,
} from '@/lib/catalog/schemas'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  const colors = await prisma.catalogElementColor.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(colors.map(mapElementColor))
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  const body = await req.json()
  const parsed = createElementColorSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  const existing = await prisma.catalogElementColor.findUnique({
    where: { hexValue: parsed.data.hexValue },
  })

  if (existing) {
    return NextResponse.json(
      { message: 'Ya existe un color de elemento con ese valor hexadecimal' },
      { status: 409 }
    )
  }

  const color = await prisma.catalogElementColor.create({
    data: {
      hexValue: parsed.data.hexValue,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  })

  return NextResponse.json(mapElementColor(color), { status: 201 })
}
