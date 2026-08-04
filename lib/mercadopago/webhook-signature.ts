import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from 'mercadopago'
import { env } from '@/lib/env'

export type WebhookSignatureResult =
  | { ok: true; validated: boolean }
  | { ok: false; status: 401; message: string }

/**
 * Valida x-signature si MP_WEBHOOK_SECRET está definida.
 * Sin secret, se acepta (útil antes de configurar el panel); se loguea warning.
 */
export function validateMercadoPagoWebhookSignature(input: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
}): WebhookSignatureResult {
  const secret = env.MP_WEBHOOK_SECRET

  if (!secret) {
    console.warn(
      '[mercadopago/webhook] MP_WEBHOOK_SECRET no configurada; se procesa sin validar firma'
    )
    return { ok: true, validated: false }
  }

  try {
    // No usar toleranceSeconds: el SDK compara `ts` (segundos Unix de MP)
    // contra Date.now() (ms), lo que rechaza siempre con TimestampOutOfTolerance.
    WebhookSignatureValidator.validate({
      xSignature: input.xSignature ?? '',
      xRequestId: input.xRequestId ?? '',
      dataId: input.dataId ?? '',
      secret,
    })
    return { ok: true, validated: true }
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.error('[mercadopago/webhook] Firma inválida', {
        reason: error.reason,
        requestId: error.requestId,
      })
      return { ok: false, status: 401, message: 'Unauthorized' }
    }
    throw error
  }
}
