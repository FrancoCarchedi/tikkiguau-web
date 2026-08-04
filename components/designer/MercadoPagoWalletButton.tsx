'use client'

import { useEffect, useState } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'

type MercadoPagoWalletButtonProps = {
  preferenceId: string
  publicKey: string
}

export function MercadoPagoWalletButton({
  preferenceId,
  publicKey,
}: MercadoPagoWalletButtonProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initMercadoPago(publicKey, { locale: 'es-AR' })
    setReady(true)
  }, [publicKey])

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Cargando botón de pago…
      </p>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Wallet initialization={{ preferenceId }} />
    </div>
  )
}
