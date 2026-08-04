import { prisma } from '@/lib/prisma'
import {
  isAutoEmailTransition,
  mapOrderToEmailPayload,
  sendStatusEmail,
} from '@/lib/email/send-order-emails'
import { getPaymentById } from '@/lib/mercadopago/client'
import type { OrderStatus, PaymentStatus } from '@/app/generated/prisma/client'

export type ApplyPaymentResult = {
  orderNumber: string
  previousStatus: OrderStatus
  status: OrderStatus
  paymentStatus: PaymentStatus
  emailSent: boolean
}

/**
 * Consulta el pago en MP y actualiza la orden de forma idempotente.
 * Si el pago está approved y la orden PENDING → APPROVED + email.
 */
export async function syncOrderFromMercadoPagoPayment(
  paymentId: string
): Promise<ApplyPaymentResult | null> {
  const payment = await getPaymentById(paymentId)

  if (!payment.externalReference) {
    console.error('[mercadopago] Pago sin external_reference:', paymentId)
    return null
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: payment.externalReference },
  })

  if (!order) {
    console.error(
      '[mercadopago] Orden no encontrada para',
      payment.externalReference
    )
    return null
  }

  if (order.paymentMethod !== 'MERCADOPAGO') {
    return {
      orderNumber: order.orderNumber,
      previousStatus: order.status,
      status: order.status,
      paymentStatus: order.paymentStatus,
      emailSent: false,
    }
  }

  const nextPaymentStatus = mapMpStatusToPaymentStatus(payment.status)
  const shouldApprove =
    payment.status === 'approved' && order.status === 'PENDING'

  const previousStatus = order.status
  const nextStatus: OrderStatus = shouldApprove ? 'APPROVED' : order.status

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      mpPaymentId: payment.id,
      paymentStatus: nextPaymentStatus,
      ...(shouldApprove ? { status: 'APPROVED' } : {}),
    },
  })

  let emailSent = false
  if (
    shouldApprove &&
    isAutoEmailTransition(previousStatus, nextStatus)
  ) {
    await sendStatusEmail(mapOrderToEmailPayload(updated))
    emailSent = true
  }

  return {
    orderNumber: updated.orderNumber,
    previousStatus,
    status: updated.status,
    paymentStatus: updated.paymentStatus,
    emailSent,
  }
}

/**
 * Fallback desde back_urls: usa payment_id o busca por external_reference.
 */
export async function syncOrderFromCheckoutReturn(input: {
  paymentId?: string | null
  externalReference?: string | null
}): Promise<ApplyPaymentResult | null> {
  if (input.paymentId && input.paymentId !== 'null') {
    return syncOrderFromMercadoPagoPayment(input.paymentId)
  }

  if (!input.externalReference) {
    return null
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: input.externalReference },
  })

  if (!order || order.paymentMethod !== 'MERCADOPAGO') {
    return null
  }

  // Sin payment_id no podemos consultar MP; devolvemos estado actual
  return {
    orderNumber: order.orderNumber,
    previousStatus: order.status,
    status: order.status,
    paymentStatus: order.paymentStatus,
    emailSent: false,
  }
}

function mapMpStatusToPaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case 'approved':
      return 'APPROVED'
    case 'rejected':
    case 'cancelled':
      return 'REJECTED'
    case 'refunded':
    case 'charged_back':
      return 'REFUNDED'
    case 'pending':
    case 'in_process':
    case 'in_mediation':
    default:
      return 'PENDING'
  }
}
