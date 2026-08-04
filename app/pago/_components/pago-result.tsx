import Link from 'next/link'
import { WHATSAPP_URL } from '@/lib/payment-details'

type PagoResultProps = {
  title: string
  description: string
  orderNumber?: string | null
  tone?: 'success' | 'warning' | 'danger'
}

export function PagoResult({
  title,
  description,
  orderNumber,
  tone = 'success',
}: PagoResultProps) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-700'
      : tone === 'warning'
        ? 'text-amber-700'
        : 'text-red-700'

  return (
    <main className="min-h-screen bg-[#D20A0A] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-5 text-center">
        <h1 className={`text-2xl font-semibold ${toneClass}`}>{title}</h1>
        {orderNumber && (
          <p className="text-sm text-zinc-600">
            Orden <strong className="text-zinc-900">{orderNumber}</strong>
          </p>
        )}
        <p className="text-zinc-600 leading-relaxed">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-5 h-10 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Consultas por WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#C70F11] hover:bg-[#C70F11]/90 text-white text-sm font-semibold px-5 h-10"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
