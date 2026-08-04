export type CheckoutPaymentMethod = 'TRANSFER' | 'MERCADOPAGO'

export const MERCADOPAGO_SURCHARGE_RATE = 0.1

export type OrderTotals = {
  productsAmount: number
  shippingAmount: number
  baseAmount: number
  paymentSurchargeAmount: number
  totalAmount: number
}

export function calculateOrderTotals(input: {
  productsAmount: number
  shippingAmount: number
  paymentMethod: CheckoutPaymentMethod
}): OrderTotals {
  const productsAmount = Math.round(input.productsAmount)
  const shippingAmount = Math.round(input.shippingAmount)
  const baseAmount = productsAmount + shippingAmount
  const paymentSurchargeAmount =
    input.paymentMethod === 'MERCADOPAGO'
      ? Math.round(baseAmount * MERCADOPAGO_SURCHARGE_RATE)
      : 0

  return {
    productsAmount,
    shippingAmount,
    baseAmount,
    paymentSurchargeAmount,
    totalAmount: baseAmount + paymentSurchargeAmount,
  }
}
