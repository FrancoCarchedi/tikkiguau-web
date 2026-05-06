import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, keyword, isActive } = body

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name.trim()
  if (isActive !== undefined) updateData.isActive = isActive

  if (keyword !== undefined) {
    const normalized = keyword.trim().toLowerCase()
    const existing = await prisma.store.findFirst({
      where: { keyword: normalized, NOT: { id } },
    })
    if (existing) {
      return NextResponse.json(
        { message: 'Ya existe una tienda con esa palabra clave' },
        { status: 409 }
      )
    }
    updateData.keyword = normalized
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { message: 'No hay campos válidos para actualizar' },
      { status: 400 }
    )
  }

  const store = await prisma.store.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(store)
}
