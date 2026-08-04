import { syncOrderFromCheckoutReturn } from '@/lib/mercadopago/sync-order-payment'
import { PagoResult } from '@/app/pago/_components/pago-result'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function firstParam(
  value: string | string[] | undefined
): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export default async function PagoSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const paymentId = firstParam(params.payment_id) ?? firstParam(params.collection_id)
  const externalReference = firstParam(params.external_reference)
  const status = firstParam(params.status) ?? firstParam(params.collection_status)

  let syncResult = null
  try {
    syncResult = await syncOrderFromCheckoutReturn({
      paymentId,
      externalReference,
    })
  } catch (error) {
    console.error('[pago/success] Error sincronizando pago:', error)
  }

  const orderNumber = syncResult?.orderNumber ?? externalReference
  const approved =
    syncResult?.status === 'APPROVED' ||
    status === 'approved' ||
    syncResult?.paymentStatus === 'APPROVED'

  if (approved) {
    return (
      <PagoResult
        tone="success"
        title="¡Pago acreditado!"
        orderNumber={orderNumber}
        description="Recibimos tu pago. Ya empezamos a preparar tu pedido y te vamos a avisar por email cuando esté listo."
      />
    )
  }

  return (
    <PagoResult
      tone="warning"
      title="Estamos confirmando tu pago"
      orderNumber={orderNumber}
      description="Tu pago puede tardar unos minutos en acreditarse. Te vamos a avisar por email cuando esté confirmado. Si tenés dudas, escribinos por WhatsApp indicando tu número de orden."
    />
  )
}
