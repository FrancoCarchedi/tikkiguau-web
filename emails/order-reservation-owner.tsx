import { Text } from '@react-email/components'
import { EmailLayout, EmailLink } from '@/emails/components/email-layout'
import { buildCustomerWhatsAppUrl } from '@/lib/payment-details'
import {
  DELIVERY_LABELS,
  formatArsEmail,
  type OrderEmailPayload,
} from '@/emails/types'

type Props = {
  order: OrderEmailPayload
}

export function OrderReservationOwnerEmail({ order }: Props) {
  const deliveryLabel = DELIVERY_LABELS[order.deliveryMethod]
  const whatsappUrl = buildCustomerWhatsAppUrl(order.phone, {
    prefillText: `Hola ${order.firstName}, te escribo por tu reserva ${order.orderNumber} en TikkiGuau.`,
  })

  return (
    <EmailLayout
      preview={`Nuevo pedido web ${order.orderNumber}`}
      title="Nuevo pedido desde la web"
    >
      <Text style={paragraph}>
        Se creó la orden <strong>{order.orderNumber}</strong>.
      </Text>
      <Text style={label}>Cliente</Text>
      <Text style={value}>
        {order.firstName} {order.lastName}
      </Text>
      <Text style={muted}>
        {order.email} · {order.phone}
      </Text>
      {whatsappUrl && (
        <Text style={paragraph}>
          <EmailLink href={whatsappUrl}>Escribir al cliente por WhatsApp</EmailLink>
        </Text>
      )}
      <Text style={label}>Entrega</Text>
      <Text style={value}>{deliveryLabel}</Text>
      {order.address && <Text style={muted}>{order.address}</Text>}
      {(order.city || order.zipCode) && (
        <Text style={muted}>
          {[order.city, order.zipCode ? `CP ${order.zipCode}` : null]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      )}
      <Text style={label}>Total</Text>
      <Text style={value}>{formatArsEmail(order.totalAmount)}</Text>
      <Text style={paragraph}>Revisá el detalle completo en el panel de administración.</Text>
    </EmailLayout>
  )
}

const paragraph = {
  color: '#27272a',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 14px',
}

const label = {
  color: '#71717a',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.06em',
  margin: '12px 0 2px',
  textTransform: 'uppercase' as const,
}

const value = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: 600,
  margin: '0 0 4px',
}

const muted = {
  color: '#52525b',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 4px',
}
