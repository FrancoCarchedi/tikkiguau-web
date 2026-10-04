import { describe, expect, it } from 'vitest'
import type {
  PublicWholesaleConfig,
  WholesaleCategory,
  WholesaleOrderLine,
} from '@/types/wholesale'
import {
  buildWholesaleWhatsAppMessage,
  buildWholesaleWhatsAppUrl,
  resolveWhatsAppPayload,
  sanitizeNotes,
  sanitizeReference,
  type WholesaleMessageInput,
} from './build-whatsapp-message'
import { WHATSAPP_MAX_URL_LENGTH } from './constants'
import { evaluateWholesaleOrder } from './order-calculator'

const BLUE = '#0041B9'
const BLACK = '#1B1B1B'

const config: PublicWholesaleConfig = {
  settings: {
    isEnabled: true,
    requireMinTotalUnits: false,
    minTotalUnits: 250,
    requireMinTotalAmount: false,
    minTotalAmountArs: 200000,
  },
  priceRules: [
    { id: 'r1', category: 'LETTER', size: '2', unitPriceArs: 881, minUnitsPerColor: 25, isActive: true },
    { id: 'r2', category: 'COLLAR', size: '1', unitPriceArs: 9200, minUnitsPerColor: 25, isActive: true },
    { id: 'r3', category: 'LETTER', size: '1', unitPriceArs: 821, minUnitsPerColor: 25, isActive: true },
  ],
}

const COLOR_NAMES: Record<string, string> = { [BLUE]: 'Azul', [BLACK]: 'Negro' }

function buildInput(
  lines: WholesaleOrderLine[],
  overrides: Partial<Pick<WholesaleMessageInput, 'reference' | 'notes'>> = {}
): WholesaleMessageInput {
  return {
    reference: 'Pedido junio — Melisa',
    notes: '',
    lines,
    evaluation: evaluateWholesaleOrder(lines, config),
    resolveColorName: (_category: WholesaleCategory, colorHex: string) => COLOR_NAMES[colorHex] ?? colorHex,
    resolveItemLabel: (_category: WholesaleCategory, itemKey: string) => itemKey,
    ...overrides,
  }
}

const letterLines: WholesaleOrderLine[] = [
  { category: 'LETTER', size: '2', colorHex: BLUE, itemKey: 'A', quantity: 10 },
  { category: 'LETTER', size: '2', colorHex: BLUE, itemKey: 'B', quantity: 10 },
  { category: 'LETTER', size: '2', colorHex: BLUE, itemKey: 'C', quantity: 5 },
]

describe('buildWholesaleWhatsAppMessage', () => {
  it('incluye referencia, grupo, formato compacto de ítems y total estimado', () => {
    const message = buildWholesaleWhatsAppMessage(buildInput(letterLines))

    expect(message).toContain('*Pedido mayorista TikkiGuau*')
    expect(message).toContain('Referencia: Pedido junio — Melisa')
    expect(message).toContain('*Letras · Talla 2 (Mediana)* · $881 c/u')
    expect(message).toContain('• Azul · 25 u · $22.025 → A×10, B×10, C×5')
    expect(message).toContain('*Total: 25 unidades · $22.025 (estimado, sin envío)*')
  })

  it('lista collares sin detalle de ítems', () => {
    const lines: WholesaleOrderLine[] = [
      { category: 'COLLAR', size: '1', colorHex: BLACK, itemKey: 'plain', quantity: 30 },
    ]
    const message = buildWholesaleWhatsAppMessage(buildInput(lines))

    expect(message).toContain('*Collares · Talla 1 (Pequeña)* · $9.200 c/u')
    expect(message).toContain('• Negro · 30 u · $276.000')
    expect(message).not.toContain('→')
  })

  it('omite la sección de notas cuando están vacías', () => {
    const message = buildWholesaleWhatsAppMessage(buildInput(letterLines, { notes: '   ' }))
    expect(message).not.toContain('Notas:')
  })

  it('incluye las notas cuando existen', () => {
    const message = buildWholesaleWhatsAppMessage(
      buildInput(letterLines, { notes: 'Lo necesito para el 20/06.' })
    )
    expect(message).toContain('Notas: Lo necesito para el 20/06.')
  })
})

describe('sanitizado de texto del usuario', () => {
  it('colapsa espacios y saltos de línea en la referencia', () => {
    expect(sanitizeReference('  Pedido\n\n junio   Melisa ')).toBe('Pedido junio Melisa')
  })

  it('recorta la referencia y las notas a sus máximos', () => {
    expect(sanitizeReference('a'.repeat(200))).toHaveLength(80)
    expect(sanitizeNotes('b'.repeat(900))).toHaveLength(500)
  })

  it('limita los saltos de línea consecutivos en las notas', () => {
    expect(sanitizeNotes('uno\n\n\n\n\ndos')).toBe('uno\n\ndos')
  })
})

describe('resolveWhatsAppPayload', () => {
  it('usa el mensaje completo cuando entra en el límite', () => {
    const payload = resolveWhatsAppPayload(buildInput(letterLines))

    expect(payload.isSummaryOnly).toBe(false)
    expect(payload.url).toBe(buildWholesaleWhatsAppUrl(payload.fullMessage))
    expect(payload.url.length).toBeLessThanOrEqual(WHATSAPP_MAX_URL_LENGTH)
  })

  it('usa el resumen breve cuando el mensaje excede el límite y conserva el completo', () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const colors = Array.from({ length: 10 }, (_, index) => `#${(index + 1).toString(16).padStart(6, '0')}`)
    const lines: WholesaleOrderLine[] = (['2', '1'] as const).flatMap((size) =>
      colors.flatMap((colorHex) =>
        letters.map((letter) => ({
          category: 'LETTER' as const,
          size,
          colorHex,
          itemKey: letter,
          quantity: 25,
        }))
      )
    )

    const payload = resolveWhatsAppPayload(buildInput(lines))

    expect(payload.isSummaryOnly).toBe(true)
    expect(payload.url.length).toBeLessThanOrEqual(WHATSAPP_MAX_URL_LENGTH)
    expect(decodeURIComponent(payload.url)).toContain('Referencia: Pedido junio — Melisa')
    expect(decodeURIComponent(payload.url)).toContain('Total: 13000 unidades')
    expect(payload.fullMessage).toContain('A×25')
  })
})
