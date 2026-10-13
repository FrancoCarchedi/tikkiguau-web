import { describe, expect, it } from 'vitest'
import { createWholesaleOrderSchema, updateWholesaleOrderSchema } from './order-schemas'

const validPayload = {
  reference: 'Pedido junio — Melisa',
  phone: '11 2345-6789',
  notes: 'Lo necesito para el 20/06.',
  lines: [{ category: 'LETTER', size: '2', colorHex: '#0041B9', itemKey: 'A', quantity: 25 }],
}

describe('createWholesaleOrderSchema', () => {
  it('acepta un pedido válido y deja la referencia saneada', () => {
    const result = createWholesaleOrderSchema.safeParse({
      ...validPayload,
      reference: '  Pedido\n junio   Melisa ',
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.reference).toBe('Pedido junio Melisa')
  })

  it('usa notas vacías cuando no se envían', () => {
    const withoutNotes = { ...validPayload, notes: undefined }
    const result = createWholesaleOrderSchema.safeParse(withoutNotes)

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.notes).toBe('')
  })

  it.each(['', '   ', 'abc', '123', '1'.repeat(16), '11 2345 6'])(
    'rechaza el teléfono "%s"',
    (phone) => {
      expect(createWholesaleOrderSchema.safeParse({ ...validPayload, phone }).success).toBe(false)
    }
  )

  it.each(['+54 9 11 2345-6789', '(011) 2345-6789', '1123456789'])(
    'acepta el teléfono "%s"',
    (phone) => {
      expect(createWholesaleOrderSchema.safeParse({ ...validPayload, phone }).success).toBe(true)
    }
  )

  it('rechaza una referencia demasiado corta', () => {
    expect(createWholesaleOrderSchema.safeParse({ ...validPayload, reference: ' ab ' }).success).toBe(
      false
    )
  })

  it('rechaza un pedido sin líneas', () => {
    expect(createWholesaleOrderSchema.safeParse({ ...validPayload, lines: [] }).success).toBe(false)
  })

  it.each([0, -1, 2.5, 10000])('rechaza la cantidad %s', (quantity) => {
    const lines = [{ ...validPayload.lines[0], quantity }]
    expect(createWholesaleOrderSchema.safeParse({ ...validPayload, lines }).success).toBe(false)
  })

  it('rechaza categorías, tallas y colores inválidos', () => {
    const invalidLines = [
      { ...validPayload.lines[0], category: 'HAT' },
      { ...validPayload.lines[0], size: '3' },
      { ...validPayload.lines[0], colorHex: 'azul' },
    ]

    for (const line of invalidLines) {
      expect(
        createWholesaleOrderSchema.safeParse({ ...validPayload, lines: [line] }).success
      ).toBe(false)
    }
  })

  it('ignora precios o totales enviados por el cliente', () => {
    const result = createWholesaleOrderSchema.safeParse({
      ...validPayload,
      totalAmountArs: 1,
      lines: [{ ...validPayload.lines[0], unitPriceArs: 1 }],
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('totalAmountArs')
      expect(result.data.lines[0]).not.toHaveProperty('unitPriceArs')
    }
  })
})

describe('updateWholesaleOrderSchema', () => {
  it.each(['NEW', 'CONTACTED', 'CLOSED', 'CANCELLED'])('acepta el estado %s', (status) => {
    expect(updateWholesaleOrderSchema.safeParse({ status }).success).toBe(true)
  })

  it.each(['PENDING', '', undefined])('rechaza el estado %s', (status) => {
    expect(updateWholesaleOrderSchema.safeParse({ status }).success).toBe(false)
  })
})
