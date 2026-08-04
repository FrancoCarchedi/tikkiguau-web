export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED'
export type DeliveryMethod = 'PICKUP' | 'CORREO_DOMICILIO' | 'CORREO_SUCURSAL'
export type PaymentMethod = 'TRANSFER' | 'MERCADOPAGO'
export type PaymentStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED'

export type Order = {
  id: string
  orderNumber: string
  status: OrderStatus
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
  trackingCode: string | null
  totalAmount: number
  orderItems: unknown
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentSurchargeAmount: number
  mpPreferenceId: string | null
  mpPaymentId: string | null
  storeId: string | null
  store: { id: string; name: string; keyword: string } | null
  createdAt: string
  updatedAt: string
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: 'Transferencia',
  MERCADOPAGO: 'Mercado Pago',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NOT_REQUIRED: 'No requiere',
  PENDING: 'Pendiente',
  APPROVED: 'Acreditado',
  REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado',
}
