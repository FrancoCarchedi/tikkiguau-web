export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED'
export type DeliveryMethod = 'PICKUP' | 'CORREO_DOMICILIO' | 'CORREO_SUCURSAL'
export type PaymentMethod = 'TRANSFER' | 'MERCADOPAGO'
export type PaymentStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED'

export type OrderEmailPayload = {
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dni: string | null
  deliveryMethod: DeliveryMethod
  address: string | null
  city: string | null
  province: string | null
  zipCode: string | null
  totalAmount: number
  trackingCode: string | null
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentSurchargeAmount: number
}

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  PICKUP: 'Retiro presencial',
  CORREO_DOMICILIO: 'Envío a domicilio',
  CORREO_SUCURSAL: 'Retiro por sucursal',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: 'Transferencia',
  MERCADOPAGO: 'Mercado Pago',
}

export function formatArsEmail(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}
