import { NextRequest, NextResponse } from 'next/server'
import { syncOrderFromMercadoPagoPayment } from '@/lib/mercadopago/sync-order-payment'
import { validateMercadoPagoWebhookSignature } from '@/lib/mercadopago/webhook-signature'

type WebhookBody = {
  type?: string
  action?: string
  topic?: string
  data?: { id?: string | number }
  id?: string | number
} | null

function extractPaymentId(
  url: URL,
  body: WebhookBody
): string | null {
  // Formato Webhooks (panel / SDK): data.id en query o body.data.id
  const fromQueryDataId = url.searchParams.get('data.id')
  if (fromQueryDataId) return fromQueryDataId

  if (body?.data?.id != null) return String(body.data.id)

  // Formato legacy / notification_url (IPN-like): ?topic=payment&id=...
  const fromQueryId = url.searchParams.get('id')
  if (fromQueryId) return fromQueryId

  if (body?.id != null && (body.type === 'payment' || body.topic === 'payment')) {
    return String(body.id)
  }

  return null
}

function extractTopic(url: URL, body: WebhookBody): string | null {
  return (
    url.searchParams.get('type') ??
    url.searchParams.get('topic') ??
    body?.type ??
    body?.topic ??
    null
  )
}

/**
 * Recibe notificaciones de:
 * - Panel Webhooks (Tus integraciones)
 * - `notification_url` de la preferencia Checkout Pro
 *
 * Flujo: validar firma (si hay secret) → obtener pago en MP → sync orden
 * (PENDING + approved → APPROVED + email). Idempotente.
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const body = (await req.json().catch(() => null)) as WebhookBody

    const paymentIdForSignature =
      url.searchParams.get('data.id') ??
      (body?.data?.id != null ? String(body.data.id) : null)

    const signature = validateMercadoPagoWebhookSignature({
      xSignature: req.headers.get('x-signature'),
      xRequestId: req.headers.get('x-request-id'),
      dataId: paymentIdForSignature,
    })

    if (!signature.ok) {
      return NextResponse.json(
        { message: signature.message },
        { status: signature.status }
      )
    }

    const topic = extractTopic(url, body)
    const paymentId = extractPaymentId(url, body)

    // Ignorar tópicos que no son payment (claims, merchant_order, etc.)
    if (topic && topic !== 'payment') {
      return NextResponse.json({ ok: true, ignored: true, topic })
    }

    if (!paymentId) {
      console.warn('[mercadopago/webhook] Sin paymentId; se ignora', {
        topic,
        query: Object.fromEntries(url.searchParams.entries()),
      })
      return NextResponse.json({ ok: true, ignored: true })
    }

    const result = await syncOrderFromMercadoPagoPayment(paymentId)

    console.info('[mercadopago/webhook] Procesado', {
      paymentId,
      orderNumber: result?.orderNumber ?? null,
      paymentStatus: result?.paymentStatus ?? null,
      status: result?.status ?? null,
      emailSent: result?.emailSent ?? false,
      signatureValidated: signature.validated,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[mercadopago/webhook] Error:', error)
    // 200 para no saturar reintentos de MP ante errores de negocio;
    // el panel de notificaciones permite reenviar si hace falta.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}

/** Healthcheck / verificación rápida desde el panel o ngrok. */
export async function GET() {
  return NextResponse.json({ ok: true, service: 'mercadopago-webhook' })
}
