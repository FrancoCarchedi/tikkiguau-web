import { getPublicCatalog } from '@/lib/catalog/get-public-catalog'
import { resolveShippingAmount } from '@/lib/catalog/catalog-helpers'
import {
  calculateOrderTotals,
  type CheckoutPaymentMethod,
  type OrderTotals,
} from '@/lib/orders/payment-pricing'
import type { DeliveryMethod } from '@/app/generated/prisma/client'

type OrderItemPriceSnapshot = {
  price?: unknown
}

/**
 * Recalcula totales desde precios vigentes del catálogo + snapshot de ítems.
 * Los precios unitarios de cada ítem se toman del catálogo vigente por productType
 * cuando es posible; si el ítem trae price numérico se usa como fallback de consistencia
 * con el carrito (el total final se valida contra el del cliente).
 */
export async function recalculateOrderTotals(input: {
  orderItems: OrderItemPriceSnapshot[]
  deliveryMethod: DeliveryMethod
  paymentMethod: CheckoutPaymentMethod
}): Promise<OrderTotals> {
  const catalog = await getPublicCatalog()

  const productsAmount = input.orderItems.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0
    return sum + price
  }, 0)

  // Validar que los precios del snapshot coincidan con el catálogo vigente
  // (productType en snapshot: collar | correa | both)
  for (const item of input.orderItems) {
    const typed = item as { productType?: string; price?: number }
    if (typeof typed.productType !== 'string' || typeof typed.price !== 'number') {
      continue
    }
    const catalogType =
      typed.productType === 'correa' ? 'leash' : typed.productType
    const catalogPrice = catalog.productPrices.find(
      (entry) => entry.productType === catalogType
    )
    if (catalogPrice && catalogPrice.amountArs !== typed.price) {
      throw new OrderPricingMismatchError(
        'Los precios del carrito no coinciden con el catálogo vigente. Actualizá la página e intentá de nuevo.'
      )
    }
  }

  const shippingAmount = resolveShippingAmount(
    catalog.shippingPrices,
    input.deliveryMethod
  )

  return calculateOrderTotals({
    productsAmount,
    shippingAmount,
    paymentMethod: input.paymentMethod,
  })
}

export class OrderPricingMismatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrderPricingMismatchError'
  }
}
