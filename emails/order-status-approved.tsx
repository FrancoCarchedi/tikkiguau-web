import { Text } from '@react-email/components'
import { EmailLayout } from '@/emails/components/email-layout'
import { EmailWhatsAppConsultas } from '@/emails/components/whatsapp-consultas'
import type { OrderEmailPayload } from '@/emails/types'

type Props = {
  order: OrderEmailPayload
}

export function OrderStatusApprovedEmail({ order }: Props) {
  const isPickup = order.deliveryMethod === 'PICKUP'

  return (
    <EmailLayout
      preview={`Tu pedido ${order.orderNumber} fue aprobado`}
      title="Pedido aprobado"
    >
      <Text style={paragraph}>
        Hola {order.firstName}, confirmamos el pago de tu orden{' '}
        <strong>{order.orderNumber}</strong>. Ya estamos trabajando en tu diseño.
      </Text>

      {isPickup ? (
        <Text style={paragraph}>
          Elegiste <strong>retiro presencial</strong>. Desde TikkiGuau nos vamos a
          contactar por WhatsApp para indicarte por dónde retirar tu pedido cuando
          esté listo.
        </Text>
      ) : (
        <Text style={paragraph}>
          Te vamos a avisar por email cuando el pedido esté listo o en camino.
        </Text>
      )}

      <EmailWhatsAppConsultas />
    </EmailLayout>
  )
}

const paragraph = {
  color: '#27272a',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 14px',
}
