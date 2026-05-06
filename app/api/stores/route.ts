import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const stores = await prisma.store.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(stores)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { name, keyword } = body

  if (!name?.trim() || !keyword?.trim()) {
    return NextResponse.json(
      { message: 'El nombre y la palabra clave son obligatorios' },
      { status: 400 }
    )
  }

  const existing = await prisma.store.findUnique({
    where: { keyword: keyword.trim().toLowerCase() },
  })

  if (existing) {
    return NextResponse.json(
      { message: 'Ya existe una tienda con esa palabra clave' },
      { status: 409 }
    )
  }

  const store = await prisma.store.create({
    data: {
      name: name.trim(),
      keyword: keyword.trim().toLowerCase(),
    },
  })

  return NextResponse.json(store, { status: 201 })
}
