export const MERCADO_PAGO_PAYMENT = {
  alias: 'tikkiguau',
  cvu: '0000003100092377228316',
  holder: 'Mayrim Melizza Mercedes Rodriguez Petit',
} as const

export const WHATSAPP_URL = 'https://wa.me/5491121816245'

/**
 * Builds a wa.me link to chat with a customer phone (Argentina-oriented).
 * Returns null if the number cannot be normalized.
 */
export function buildCustomerWhatsAppUrl(
  phone: string,
  options?: { prefillText?: string }
): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return null

  let international: string
  if (digits.startsWith('54')) {
    international = digits
  } else if (digits.startsWith('9') && digits.length >= 10) {
    international = `54${digits}`
  } else {
    const local = digits.replace(/^0+/, '')
    international = `549${local}`
  }

  const base = `https://wa.me/${international}`
  if (!options?.prefillText) return base

  return `${base}?text=${encodeURIComponent(options.prefillText)}`
}
