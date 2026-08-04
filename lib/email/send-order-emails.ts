import { createElement } from 'react'
import { env } from '@/lib/env'
import { sendReactEmail } from '@/lib/email/render-and-send'
import { OrderReservationCustomerEmail } from '@/emails/order-reservation-customer'
import { OrderReservationOwnerEmail } from '@/emails/order-reservation-owner'
import { OrderStatusApprovedEmail } from '@/emails/order-status-approved'
import { OrderStatusRejectedEmail } from '@/emails/order-status-rejected'
import { OrderStatusDeliveredEmail } from '@/emails/order-status-delivered'
import type { OrderEmailPayload, OrderStatus } from '@/emails/types'

const AUTO_EMAIL_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'DELIVERED'],
  APPROVED: ['DELIVERED', 'REJECTED'],
  REJECTED: [],
  DELIVERED: [],
}

export function isAutoEmailTransition(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  if (from === to) return false
  return AUTO_EMAIL_TRANSITIONS[from].includes(to)
}

function toPayload(order: OrderEmailPayload): OrderEmailPayload {
  return order
}

export async function sendReservationEmails(
  order: OrderEmailPayload
): Promise<void> {
  const payload = toPayload(order)
  const notifyEmail = env.ORDER_NOTIFY_EMAIL

  const tasks: Promise<unknown>[] = [
    sendReactEmail({
      to: payload.email,
      subject: `Reserva confirmada ${payload.orderNumber} — TikkiGuau`,
      react: createElement(OrderReservationCustomerEmail, { order: payload }),
    }),
  ]

  if (notifyEmail) {
    tasks.push(
      sendReactEmail({
        to: notifyEmail,
        subject: `Nuevo pedido web ${payload.orderNumber}`,
        react: createElement(OrderReservationOwnerEmail, { order: payload }),
      })
    )
  } else {
    console.error(
      '[email] ORDER_NOTIFY_EMAIL no configurado; se omite aviso a Melizza'
    )
  }

  await Promise.allSettled(tasks)
}

export async function sendStatusEmail(order: OrderEmailPayload): Promise<void> {
  await sendCustomerEmailForCurrentStatus(order)
}

export async function sendCustomerEmailForCurrentStatus(
  order: OrderEmailPayload
): Promise<{ ok: true } | { ok: false; error: string }> {
  const payload = toPayload(order)

  switch (payload.status) {
    case 'PENDING':
      return sendReactEmail({
        to: payload.email,
        subject: `Reserva confirmada ${payload.orderNumber} — TikkiGuau`,
        react: createElement(OrderReservationCustomerEmail, { order: payload }),
      })
    case 'APPROVED':
      return sendReactEmail({
        to: payload.email,
        subject: `Pedido aprobado ${payload.orderNumber} — TikkiGuau`,
        react: createElement(OrderStatusApprovedEmail, { order: payload }),
      })
    case 'REJECTED':
      return sendReactEmail({
        to: payload.email,
        subject: `Actualización de tu pedido ${payload.orderNumber} — TikkiGuau`,
        react: createElement(OrderStatusRejectedEmail, { order: payload }),
      })
    case 'DELIVERED': {
      const isPickup = payload.deliveryMethod === 'PICKUP'
      return sendReactEmail({
        to: payload.email,
        subject: isPickup
          ? `Pedido entregado ${payload.orderNumber} — TikkiGuau`
          : `Pedido enviado ${payload.orderNumber} — TikkiGuau`,
        react: createElement(OrderStatusDeliveredEmail, { order: payload }),
      })
    }
    default: {
      const _exhaustive: never = payload.status
      return { ok: false, error: `Estado no soportado: ${_exhaustive}` }
    }
  }
}

export function mapOrderToEmailPayload(order: {
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dni?: string | null
  deliveryMethod: OrderEmailPayload['deliveryMethod']
  address: string | null
  city: string | null
  province?: string | null
  zipCode: string | null
  totalAmount: number
  trackingCode: string | null
  status: OrderStatus
  paymentMethod?: OrderEmailPayload['paymentMethod'] | null
  paymentStatus?: OrderEmailPayload['paymentStatus'] | null
  paymentSurchargeAmount?: number | null
}): OrderEmailPayload {
  return {
    orderNumber: order.orderNumber,
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email,
    phone: order.phone,
    dni: order.dni ?? null,
    deliveryMethod: order.deliveryMethod,
    address: order.address,
    city: order.city,
    province: order.province ?? null,
    zipCode: order.zipCode,
    totalAmount: order.totalAmount,
    trackingCode: order.trackingCode,
    status: order.status,
    paymentMethod: order.paymentMethod ?? 'TRANSFER',
    paymentStatus: order.paymentStatus ?? 'NOT_REQUIRED',
    paymentSurchargeAmount: order.paymentSurchargeAmount ?? 0,
  }
}
