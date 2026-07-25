import type { ReactElement } from 'react'
import { env } from '@/lib/env'
import { getResendClient } from '@/lib/resend'

export async function sendReactEmail(params: {
  to: string
  subject: string
  react: ReactElement
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resend = getResendClient()
  const from = env.EMAIL_FROM

  if (!resend || !from) {
    const message =
      'Email no configurado: faltan RESEND_API_KEY y/o EMAIL_FROM'
    console.error(`[email] ${message}`)
    return { ok: false, error: message }
  }

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    react: params.react,
  })

  if (error) {
    console.error('[email] Resend error:', error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
