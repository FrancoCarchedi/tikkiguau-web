import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { env } from '@/lib/env'

function requireAccessToken(): string {
  const token = env.MP_ACCESS_TOKEN
  if (!token) {
    throw new Error('MP_ACCESS_TOKEN no configurado')
  }
  return token
}

export function getMercadoPagoClient(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: requireAccessToken() })
}

export function getAppBaseUrl(): string {
  const base = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_APP_URL no configurado. Usá la URL pública HTTPS (ngrok o dominio).'
    )
  }
  return base
}

export type CreateCheckoutPreferenceInput = {
  orderNumber: string
  title: string
  totalAmount: number
  payerEmail: string
}

export async function createCheckoutPreference(
  input: CreateCheckoutPreferenceInput
): Promise<{ preferenceId: string }> {
  const client = getMercadoPagoClient()
  const preference = new Preference(client)
  const baseUrl = getAppBaseUrl()

  // auto_return: 'approved' requires a publicly accessible HTTPS URL.
  // In local dev (http://localhost) MP rejects the preference, so we only
  // enable it in production where NEXT_PUBLIC_APP_URL uses HTTPS.
  const isHttps = baseUrl.startsWith('https://')

  const result = await preference.create({
    body: {
      items: [
        {
          id: input.orderNumber,
          title: input.title,
          quantity: 1,
          unit_price: input.totalAmount,
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: input.payerEmail,
      },
      external_reference: input.orderNumber,
      back_urls: {
        success: `${baseUrl}/pago/success`,
        failure: `${baseUrl}/pago/failure`,
        pending: `${baseUrl}/pago/pending`,
      },
      ...(isHttps && { auto_return: 'approved' }),
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      metadata: {
        order_number: input.orderNumber,
      },
    },
  })

  if (!result.id) {
    throw new Error('Mercado Pago no devolvió preferenceId')
  }

  return { preferenceId: result.id }
}

export type MercadoPagoPaymentSummary = {
  id: string
  status: string
  externalReference: string | null
}

export async function getPaymentById(
  paymentId: string
): Promise<MercadoPagoPaymentSummary> {
  const client = getMercadoPagoClient()
  const payment = new Payment(client)
  const result = await payment.get({ id: paymentId })

  return {
    id: String(result.id ?? paymentId),
    status: result.status ?? 'unknown',
    externalReference: result.external_reference ?? null,
  }
}
