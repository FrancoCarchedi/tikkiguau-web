import { Text } from '@react-email/components'
import { EmailLayout } from '@/emails/components/email-layout'
import { EmailWhatsAppConsultas } from '@/emails/components/whatsapp-consultas'
import type { OrderEmailPayload } from '@/emails/types'

type Props = {
  order: OrderEmailPayload
}

export function OrderStatusRejectedEmail({ order }: Props) {
  return (
    <EmailLayout
      preview={`Actualización de tu pedido ${order.orderNumber}`}
      title="Pedido no continuado"
    >
      <Text style={paragraph}>
        Hola {order.firstName}, lamentamos informarte que la orden{' '}
        <strong>{order.orderNumber}</strong> no podrá continuar.
      </Text>
      <Text style={paragraph}>
        Si ya realizaste una transferencia o tenés dudas, escribinos y te ayudamos a
        resolverlo.
      </Text>
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
