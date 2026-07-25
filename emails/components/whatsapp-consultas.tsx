import { Text } from '@react-email/components'
import { EmailLink } from '@/emails/components/email-layout'
import { WHATSAPP_URL } from '@/lib/payment-details'

const paragraph = {
  color: '#27272a',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 14px',
}

/** Footer de contacto consistente en emails al cliente. */
export function EmailWhatsAppConsultas() {
  return (
    <Text style={paragraph}>
      ¿Consultas?{' '}
      <EmailLink href={WHATSAPP_URL}>Escribinos por WhatsApp</EmailLink>
    </Text>
  )
}
