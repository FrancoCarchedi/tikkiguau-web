import type { Metadata } from 'next'
import { CatalogProvider } from '@/components/catalog/catalog-provider'
import WholesalePage from '@/components/wholesale/WholesalePage'
import WholesaleUnavailable from '@/components/wholesale/WholesaleUnavailable'
import { getPublicCatalog } from '@/lib/catalog/get-public-catalog'
import { getPublicWholesaleConfig } from '@/lib/wholesale/wholesale-queries'

export const dynamic = 'force-dynamic'

const TITLE = 'Venta mayorista de letras, emojis, collares y correas'
const DESCRIPTION =
  'Armá tu pedido por mayor de letras, emojis, collares y correas TikkiGuau: elegí talla, color y cantidades, y envialo por WhatsApp.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/mayorista',
  },
  openGraph: {
    title: `${TITLE} | TikkiGuau`,
    description: DESCRIPTION,
    url: '/mayorista',
  },
}

async function loadWholesaleData() {
  try {
    const [catalog, config] = await Promise.all([getPublicCatalog(), getPublicWholesaleConfig()])
    return { catalog, config }
  } catch {
    // Sin valores por defecto: los precios mayoristas solo existen en la base de datos.
    return null
  }
}

export default async function MayoristaPage() {
  const data = await loadWholesaleData()

  if (!data) {
    return <WholesaleUnavailable reason="error" />
  }

  if (!data.config.settings.isEnabled) {
    return <WholesaleUnavailable reason="disabled" />
  }

  return (
    <CatalogProvider catalog={data.catalog}>
      <WholesalePage config={data.config} />
    </CatalogProvider>
  )
}
