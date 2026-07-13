import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function requireAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ message: 'No autorizado' }, { status: 401 }),
    }
  }

  return { session, error: null }
}
