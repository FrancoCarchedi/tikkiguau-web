export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED'
export type DeliveryMethod = 'PICKUP' | 'CORREO_DOMICILIO' | 'CORREO_SUCURSAL'

export type Order = {
  id: string
  orderNumber: string
  status: OrderStatus
  firstName: string
  lastName: string
  email: string
  phone: string
  deliveryMethod: DeliveryMethod
  address: string | null
  city: string | null
  zipCode: string | null
  trackingCode: string | null
  totalAmount: number
  orderItems: unknown
  storeId: string | null
  store: { id: string; name: string; keyword: string } | null
  createdAt: string
  updatedAt: string
}
