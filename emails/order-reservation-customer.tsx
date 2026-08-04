import { Text } from '@react-email/components'
import { EmailLayout, EmailLink } from '@/emails/components/email-layout'
import { EmailWhatsAppConsultas } from '@/emails/components/whatsapp-consultas'
import { MERCADO_PAGO_PAYMENT, WHATSAPP_URL } from '@/lib/payment-details'
import {
  DELIVERY_LABELS,
  formatArsEmail,
  type OrderEmailPayload,
} from '@/emails/types'

type Props = {
  order: OrderEmailPayload
}

export function OrderReservationCustomerEmail({ order }: Props) {
  const deliveryLabel = DELIVERY_LABELS[order.deliveryMethod]
  const isMercadoPago = order.paymentMethod === 'MERCADOPAGO'

  return (
    <EmailLayout
      preview={
        isMercadoPago
          ? `Reserva ${order.orderNumber} — completá el pago online`
          : `Reserva ${order.orderNumber} confirmada — datos para transferir`
      }
      title="¡Reserva confirmada!"
    >
      <Text style={paragraph}>
        Hola {order.firstName}, recibimos tu reserva. Tu número de orden es{' '}
        <strong>{order.orderNumber}</strong>.
      </Text>
      <Text style={paragraph}>
        Método de entrega: <strong>{deliveryLabel}</strong>.
      </Text>
      {order.deliveryMethod === 'CORREO_DOMICILIO' && (
        <>
          <Text style={label}>Dirección de envío</Text>
          {order.address && <Text style={value}>{order.address}</Text>}
          {order.city && (
            <>
              <Text style={label}>Ciudad</Text>
              <Text style={value}>{order.city}</Text>
            </>
          )}
          {order.zipCode && (
            <>
              <Text style={label}>Código postal</Text>
              <Text style={value}>{order.zipCode}</Text>
            </>
          )}
        </>
      )}
      {order.deliveryMethod === 'CORREO_SUCURSAL' && (
        <>
          <Text style={label}>Dirección de sucursal</Text>
          {order.address && <Text style={value}>{order.address}</Text>}
          {order.city && (
            <>
              <Text style={label}>Ciudad</Text>
              <Text style={value}>{order.city}</Text>
            </>
          )}
          {order.zipCode && (
            <>
              <Text style={label}>Código postal</Text>
              <Text style={value}>{order.zipCode}</Text>
            </>
          )}
        </>
      )}

      {isMercadoPago ? (
        <>
          <Text style={paragraph}>
            Total a pagar online:{' '}
            <strong>{formatArsEmail(order.totalAmount)}</strong>
            {order.paymentSurchargeAmount > 0 && (
              <>
                {' '}
                (incluye recargo de Mercado Pago de{' '}
                {formatArsEmail(order.paymentSurchargeAmount)})
              </>
            )}
          </Text>
          <Text style={paragraph}>
            Completá el pago con Mercado Pago desde la web (dinero en cuenta, débito
            o crédito). Cuando se acredite, te enviamos la confirmación de pedido
            aprobado.
          </Text>
        </>
      ) : (
        <>
          <Text style={paragraph}>
            Total a transferir:{' '}
            <strong>{formatArsEmail(order.totalAmount)}</strong>
          </Text>
          <Text style={paragraph}>
            Realizá el pago por transferencia a nuestra cuenta de Mercado Pago. Una
            vez acreditado, comenzamos a confeccionar tu pedido.
          </Text>
          <Text style={label}>Alias</Text>
          <Text style={value}>{MERCADO_PAGO_PAYMENT.alias}</Text>
          <Text style={label}>CVU</Text>
          <Text style={valueMono}>{MERCADO_PAGO_PAYMENT.cvu}</Text>
          <Text style={label}>Titular</Text>
          <Text style={value}>{MERCADO_PAGO_PAYMENT.holder}</Text>
          <Text style={paragraph}>
            Cuando hagas la transferencia, enviá el comprobante por WhatsApp e
            indicá tu número de orden <strong>{order.orderNumber}</strong>:{' '}
            <EmailLink href={WHATSAPP_URL}>Abrir WhatsApp</EmailLink>
          </Text>
        </>
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

const valueMono = {
  ...value,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
}
