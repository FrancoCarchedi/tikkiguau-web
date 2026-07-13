import { mapLetter } from '@/lib/catalog/mappers'
import { requireAdminSession } from '@/lib/catalog/require-admin'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  const letters = await prisma.catalogLetter.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      colors: { include: { elementColor: true } },
    },
  })

  return NextResponse.json(letters.map(mapLetter))
}
