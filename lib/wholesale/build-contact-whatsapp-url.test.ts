import { describe, expect, it } from 'vitest'
import { buildContactWhatsAppUrl } from './build-contact-whatsapp-url'

describe('buildContactWhatsAppUrl', () => {
  it('antepone 549 a un número argentino de 10 dígitos', () => {
    expect(buildContactWhatsAppUrl('11 2345-6789')).toBe('https://wa.me/5491123456789')
  })

  it('respeta un número que ya incluye el código de país', () => {
    expect(buildContactWhatsAppUrl('+54 9 11 2345 6789')).toBe('https://wa.me/5491123456789')
  })

  it('devuelve null si no hay dígitos', () => {
    expect(buildContactWhatsAppUrl('---')).toBeNull()
  })
})
