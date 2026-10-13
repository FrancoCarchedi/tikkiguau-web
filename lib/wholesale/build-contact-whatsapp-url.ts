const ARGENTINE_LOCAL_NUMBER_LENGTH = 10
const ARGENTINE_MOBILE_PREFIX = '549'

/**
 * Los clientes cargan el teléfono con código de área y sin 0 ni 15, por lo que un número de
 * 10 dígitos es argentino. Si trae más dígitos se asume que ya incluye el código de país.
 */
export function buildContactWhatsAppUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 0) return null

  const internationalNumber =
    digits.length === ARGENTINE_LOCAL_NUMBER_LENGTH ? `${ARGENTINE_MOBILE_PREFIX}${digits}` : digits

  return `https://wa.me/${internationalNumber}`
}
