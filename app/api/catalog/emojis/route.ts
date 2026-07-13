import { mapEmoji } from '@/lib/catalog/mappers'
import { requireAdminSession } from '@/lib/catalog/require-admin'
import { createEmojiSchema, parseSvgMarkup } from '@/lib/catalog/schemas'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  const emojis = await prisma.catalogEmoji.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      colors: { include: { elementColor: true } },
    },
  })

  return NextResponse.json(emojis.map(mapEmoji))
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  const body = await req.json()
  const parsed = createEmojiSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  const existing = await prisma.catalogEmoji.findUnique({
    where: { key: parsed.data.key },
  })

  if (existing) {
    return NextResponse.json(
      { message: 'Ya existe un emoji con esa clave' },
      { status: 409 }
    )
  }

  const svgMarkup = parseSvgMarkup(parsed.data.svgMarkup)
  const colorIds = parsed.data.colorIds ?? []

  if (colorIds.length > 0) {
    const validColors = await prisma.catalogElementColor.findMany({
      where: { id: { in: colorIds } },
      select: { id: true },
    })
    if (validColors.length !== colorIds.length) {
      return NextResponse.json(
        { message: 'Uno o más colores de elemento no existen' },
        { status: 400 }
      )
    }
  }

  const emoji = await prisma.catalogEmoji.create({
    data: {
      key: parsed.data.key,
      label: parsed.data.label,
      svgMarkup,
      sortOrder: parsed.data.sortOrder ?? 0,
      availableSizes: parsed.data.availableSizes
        ? [...parsed.data.availableSizes]
        : ['1', '2'],
      colors:
        colorIds.length > 0
          ? {
              create: colorIds.map((elementColorId) => ({ elementColorId })),
            }
          : undefined,
    },
    include: {
      colors: { include: { elementColor: true } },
    },
  })

  return NextResponse.json(mapEmoji(emoji), { status: 201 })
}
