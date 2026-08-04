import { PagoResult } from '@/app/pago/_components/pago-result'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function firstParam(
  value: string | string[] | undefined
): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export default async function PagoPendingPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const orderNumber = firstParam(params.external_reference)

  return (
    <PagoResult
      tone="warning"
      title="Pago pendiente"
      orderNumber={orderNumber}
      description="Tu pago quedó pendiente de acreditación (por ejemplo, un medio offline). Te avisamos por email cuando se confirme. Si necesitás ayuda, escribinos por WhatsApp con tu número de orden."
    />
  )
}
