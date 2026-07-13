import { getPublicCatalog } from '@/lib/catalog/get-public-catalog'
import { NextResponse } from 'next/server'

export async function GET() {
  const catalog = await getPublicCatalog()
  return NextResponse.json(catalog, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
