import { mapEmoji } from '@/lib/catalog/mappers'
import { requireAdminSession } from '@/lib/catalog/require-admin'
import { parseSvgMarkup, updateEmojiSchema } from '@/lib/catalog/schemas'
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
  const parsed = updateEmojiSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  if (parsed.data.key) {
    const existing = await prisma.catalogEmoji.findFirst({
      where: { key: parsed.data.key, NOT: { id } },
    })
    if (existing) {
      return NextResponse.json(
        { message: 'Ya existe un emoji con esa clave' },
        { status: 409 }
      )
    }
  }

  const { colorIds, svgMarkup, availableSizes, ...emojiData } = parsed.data

  if (colorIds) {
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

    await prisma.catalogEmojiColor.deleteMany({ where: { emojiId: id } })
    await prisma.catalogEmojiColor.createMany({
      data: colorIds.map((elementColorId) => ({
        emojiId: id,
        elementColorId,
      })),
      skipDuplicates: true,
    })
  }

  const emoji = await prisma.catalogEmoji.update({
    where: { id },
    data: {
      ...emojiData,
      ...(svgMarkup ? { svgMarkup: parseSvgMarkup(svgMarkup) } : {}),
      ...(availableSizes ? { availableSizes: [...availableSizes] } : {}),
    },
    include: {
      colors: { include: { elementColor: true } },
    },
  })

  return NextResponse.json(mapEmoji(emoji))
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession()
  if (error) return error

  const { id } = await params

  await prisma.catalogEmoji.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
