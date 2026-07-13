import { mapBaseColor } from '@/lib/catalog/mappers'
import { requireAdminSession } from '@/lib/catalog/require-admin'
import { createBaseColorSchema } from '@/lib/catalog/schemas'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  const colors = await prisma.catalogBaseColor.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(colors.map(mapBaseColor))
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  const body = await req.json()
  const parsed = createBaseColorSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  const existing = await prisma.catalogBaseColor.findUnique({
    where: { hexValue: parsed.data.hexValue },
  })

  if (existing) {
    return NextResponse.json(
      { message: 'Ya existe un color con ese valor hexadecimal' },
      { status: 409 }
    )
  }

  const color = await prisma.catalogBaseColor.create({
    data: {
      name: parsed.data.name,
      hexValue: parsed.data.hexValue,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  })

  return NextResponse.json(mapBaseColor(color), { status: 201 })
}
