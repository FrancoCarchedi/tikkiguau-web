import { Text } from '@react-email/components'
import { EmailLayout } from '@/emails/components/email-layout'
import { EmailWhatsAppConsultas } from '@/emails/components/whatsapp-consultas'
import type { OrderEmailPayload } from '@/emails/types'

type Props = {
  order: OrderEmailPayload
}

export function OrderStatusDeliveredEmail({ order }: Props) {
  const isPickup = order.deliveryMethod === 'PICKUP'
  const isBranchShipping = order.deliveryMethod === 'CORREO_SUCURSAL'

  const shippingBody = isBranchShipping
    ? (
        <>
          tu orden <strong>{order.orderNumber}</strong> ha sido enviada a la sucursal de
          entrega seleccionada.
        </>
      )
    : (
        <>
          tu orden <strong>{order.orderNumber}</strong> ha sido enviada al domicilio de
          entrega indicado.
        </>
      )

  return (
    <EmailLayout
      preview={
        isPickup
          ? `Tu pedido ${order.orderNumber} fue entregado`
          : `Tu pedido ${order.orderNumber} fue enviado`
      }
      title={isPickup ? 'Pedido entregado' : 'Pedido enviado'}
    >
      {isPickup ? (
        <>
          <Text style={paragraph}>
            Hola {order.firstName}, confirmamos que tu orden{' '}
            <strong>{order.orderNumber}</strong> fue entregada en el retiro presencial.
          </Text>
          <Text style={paragraph}>¡Muchas gracias por elegir TikkiGuau!</Text>
        </>
      ) : (
        <>
          <Text style={paragraph}>
            Hola {order.firstName}, {shippingBody}
          </Text>
          {order.trackingCode ? (
            <Text style={paragraph}>
              Código de seguimiento:{' '}
              <strong style={{ fontFamily: 'ui-monospace, monospace' }}>
                {order.trackingCode}
              </strong>
            </Text>
          ) : null}
          <Text style={paragraph}>¡Gracias por elegir TikkiGuau!</Text>
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
