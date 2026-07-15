import type { Metadata } from 'next'
import { getPublicCatalog } from '@/lib/catalog/get-public-catalog'
import { getStaticCatalogFallback } from '@/lib/catalog/static-fallback'
import { CatalogProvider } from '@/components/catalog/catalog-provider'
import DesignerPage from '@/components/designer/DesignerPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Diseñar mi collar',
  description:
    'Armá tu collar o correa personalizado eligiendo colores, letras y emojis. Confirmá tu reserva y pagá por transferencia.',
  alternates: {
    canonical: '/disenar',
  },
  openGraph: {
    title: 'Diseñar mi collar | TikkiGuau',
    description:
      'Armá tu collar o correa personalizado eligiendo colores, letras y emojis. Confirmá tu reserva y pagá por transferencia.',
    url: '/disenar',
  },
}

async function loadCatalog() {
  try {
    return await getPublicCatalog()
  } catch {
    return getStaticCatalogFallback()
  }
}

export default async function DisenarPage() {
  const catalog = await loadCatalog()

  return (
    <CatalogProvider catalog={catalog}>
      <DesignerPage />
    </CatalogProvider>
  )
}
