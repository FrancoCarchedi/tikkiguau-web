import { PagoResult } from '@/app/pago/_components/pago-result'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function firstParam(
  value: string | string[] | undefined
): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export default async function PagoFailurePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const orderNumber = firstParam(params.external_reference)

  return (
    <PagoResult
      tone="danger"
      title="No se pudo completar el pago"
      orderNumber={orderNumber}
      description="El pago fue rechazado o cancelado. Podés volver al diseñador e intentar de nuevo, o escribirnos por WhatsApp para ayudarte."
    />
  )
}
