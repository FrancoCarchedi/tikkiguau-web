export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED'
export type DeliveryMethod = 'PICKUP' | 'CORREO_DOMICILIO' | 'CORREO_SUCURSAL'

export type OrderEmailPayload = {
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  deliveryMethod: DeliveryMethod
  address: string | null
  city: string | null
  zipCode: string | null
  totalAmount: number
  trackingCode: string | null
  status: OrderStatus
}

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  PICKUP: 'Retiro presencial',
  CORREO_DOMICILIO: 'Envío a domicilio',
  CORREO_SUCURSAL: 'Retiro por sucursal',
}

export function formatArsEmail(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}
