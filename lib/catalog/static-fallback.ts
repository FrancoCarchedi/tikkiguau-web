import type { PublicCatalogDto } from '@/types/catalog'
import { getFallbackEmojis } from '@/lib/catalog/fallback-emojis'

const FALLBACK_BASE_COLORS = [
  { id: 'seed-1', name: 'Rojo', hexValue: '#C70F11', isActive: true, sortOrder: 0 },
  { id: 'seed-2', name: 'Celeste', hexValue: '#2590B4', isActive: true, sortOrder: 1 },
  { id: 'seed-3', name: 'Verde manzana', hexValue: '#84A308', isActive: true, sortOrder: 2 },
  { id: 'seed-4', name: 'Naranja', hexValue: '#D93C1B', isActive: true, sortOrder: 3 },
  { id: 'seed-5', name: 'Negro', hexValue: '#111111', isActive: true, sortOrder: 4 },
  { id: 'seed-6', name: 'Rosado', hexValue: '#C7295C', isActive: true, sortOrder: 5 },
  { id: 'seed-7', name: 'Violeta', hexValue: '#4B2A61', isActive: true, sortOrder: 6 },
  { id: 'seed-8', name: 'Azul', hexValue: '#1C5394', isActive: true, sortOrder: 7 },
  { id: 'seed-9', name: 'Verde oscuro', hexValue: '#2A6A5C', isActive: true, sortOrder: 8 },
]

const FALLBACK_ELEMENT_COLORS = [
  '#FAFAFA', '#1B1B1B', '#FAC2DD', '#FEF31B',
  '#F6732D', '#93CDF5', '#8CE186', '#E0374E',
  '#0041B9', '#E1CBF1',
].map((hexValue, index) => ({
  id: `seed-el-${index}`,
  hexValue,
  isActive: true,
  sortOrder: index,
}))

const FALLBACK_PRODUCT_PRICES = [
  {
    id: 'seed-collar',
    productType: 'collar' as const,
    amountArs: 20000,
    pieces: 6,
    label: 'Collar',
    description: 'Incluye collar y 6 piezas en total.',
  },
  {
    id: 'seed-leash',
    productType: 'leash' as const,
    amountArs: 26000,
    pieces: 10,
    label: 'Correa',
    description: 'Incluye correa y 10 piezas en total.',
  },
  {
    id: 'seed-both',
    productType: 'both' as const,
    amountArs: 39000,
    pieces: 16,
    label: 'Combo',
    description: 'Incluye correa y collar. 16 piezas en total.',
  },
]

export function getStaticCatalogFallback(): PublicCatalogDto {
  return {
    baseColors: FALLBACK_BASE_COLORS,
    elementColors: FALLBACK_ELEMENT_COLORS,
    letters: [],
    emojis: getFallbackEmojis(),
    productPrices: FALLBACK_PRODUCT_PRICES,
    shippingPrices: [
      {
        id: 'seed-ship-pickup',
        deliveryMethod: 'PICKUP',
        amountArs: 0,
      },
      {
        id: 'seed-ship-branch',
        deliveryMethod: 'CORREO_SUCURSAL',
        amountArs: 8000,
      },
      {
        id: 'seed-ship-home',
        deliveryMethod: 'CORREO_DOMICILIO',
        amountArs: 12000,
      },
    ],
  }
}
