import { mapLetter } from '@/lib/catalog/mappers'
import { requireAdminSession } from '@/lib/catalog/require-admin'
import { updateLetterSchema } from '@/lib/catalog/schemas'
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
  const parsed = updateLetterSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  const { colorIds, ...letterData } = parsed.data

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

    await prisma.catalogLetterColor.deleteMany({ where: { letterId: id } })
    await prisma.catalogLetterColor.createMany({
      data: colorIds.map((elementColorId) => ({
        letterId: id,
        elementColorId,
      })),
      skipDuplicates: true,
    })
  }

  const letter = await prisma.catalogLetter.update({
    where: { id },
    data: letterData,
    include: {
      colors: { include: { elementColor: true } },
    },
  })

  return NextResponse.json(mapLetter(letter))
}
