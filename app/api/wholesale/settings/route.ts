import { requireAdminSession } from '@/lib/catalog/require-admin'
import { WHOLESALE_SETTINGS_ID } from '@/lib/wholesale/constants'
import { mapWholesaleSettings } from '@/lib/wholesale/mappers'
import { mergeAndValidateSettings, updateWholesaleSettingsSchema } from '@/lib/wholesale/schemas'
import { getWholesaleSettings } from '@/lib/wholesale/wholesale-queries'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    return NextResponse.json(await getWholesaleSettings())
  } catch {
    return NextResponse.json(
      { message: 'No se pudieron cargar los ajustes mayoristas' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Datos inválidos' }, { status: 400 })
  }

  const parsedPatch = updateWholesaleSettingsSchema.safeParse(body)
  if (!parsedPatch.success) {
    return NextResponse.json(
      { message: parsedPatch.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  try {
    const current = await getWholesaleSettings()
    const merged = mergeAndValidateSettings(current, parsedPatch.data)
    if (!merged.success) {
      return NextResponse.json(
        { message: merged.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      )
    }

    const settings = await prisma.wholesaleSettings.update({
      where: { id: WHOLESALE_SETTINGS_ID },
      data: parsedPatch.data,
    })

    return NextResponse.json(mapWholesaleSettings(settings))
  } catch {
    return NextResponse.json(
      { message: 'No se pudieron actualizar los ajustes mayoristas' },
      { status: 500 }
    )
  }
}
