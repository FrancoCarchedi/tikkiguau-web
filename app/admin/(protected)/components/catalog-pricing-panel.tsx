'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  useCatalogProductPrices,
  useCatalogShippingPrices,
  useUpdateCatalogProductPrice,
  useUpdateCatalogShippingPrice,
} from '../hooks/use-catalog-pricing'

const DELIVERY_LABELS: Record<string, string> = {
  CORREO_DOMICILIO: 'Correo Argentino a domicilio',
  CORREO_SUCURSAL: 'Correo Argentino a sucursal',
}

export function CatalogPricingPanel() {
  const { data: productPrices, isLoading: loadingProducts } = useCatalogProductPrices()
  const { data: shippingPrices, isLoading: loadingShipping } = useCatalogShippingPrices()
  const { mutate: updateProductPrice, isPending: updatingProduct } =
    useUpdateCatalogProductPrice()
  const { mutate: updateShippingPrice, isPending: updatingShipping } =
    useUpdateCatalogShippingPrice()

  const [productDrafts, setProductDrafts] = useState<Record<string, string>>({})
  const [shippingDrafts, setShippingDrafts] = useState<Record<string, string>>({})

  function getProductDraft(id: string, fallback: number) {
    return productDrafts[id] ?? String(fallback)
  }

  function getShippingDraft(id: string, fallback: number) {
    return shippingDrafts[id] ?? String(fallback)
  }

  if (loadingProducts || loadingShipping) {
    return <p className="text-sm text-muted-foreground">Cargando precios...</p>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Precios de productos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {productPrices?.map((price) => (
            <div key={price.id} className="rounded-lg border p-4">
              <p className="font-semibold">{price.label}</p>
              <p className="mb-3 text-xs text-muted-foreground">{price.description}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Precio (ARS)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={getProductDraft(price.id, price.amountArs)}
                    onChange={(e) =>
                      setProductDrafts((current) => ({
                        ...current,
                        [price.id]: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Piezas incluidas</Label>
                  <Input value={String(price.pieces)} disabled />
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                <Label>Descripción</Label>
                <Textarea
                  defaultValue={price.description}
                  id={`product-desc-${price.id}`}
                  rows={2}
                />
              </div>
              <Button
                className="mt-3"
                size="sm"
                disabled={updatingProduct}
                onClick={() => {
                  const amountArs = Number(getProductDraft(price.id, price.amountArs))
                  const description = (
                    document.getElementById(
                      `product-desc-${price.id}`
                    ) as HTMLTextAreaElement
                  )?.value

                  updateProductPrice(
                    {
                      id: price.id,
                      amountArs,
                      description: description?.trim() || price.description,
                    },
                    {
                      onSuccess: () => toast.success(`Precio de ${price.label} actualizado`),
                      onError: (err) => {
                        toast.error(
                          (err.response as { data?: { message?: string } } | undefined)?.data
                            ?.message ?? 'Error al actualizar el precio'
                        )
                      },
                    }
                  )
                }}
              >
                {updatingProduct && <Spinner className="mr-2 size-4" />}
                Guardar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Precios de envío</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            El retiro presencial no tiene costo (PICKUP = $0).
          </p>
          {shippingPrices?.map((price) => (
            <div key={price.id} className="rounded-lg border p-4">
              <p className="mb-3 font-semibold">
                {DELIVERY_LABELS[price.deliveryMethod] ?? price.deliveryMethod}
              </p>
              <div className="flex flex-col gap-1.5">
                <Label>Costo (ARS)</Label>
                <Input
                  type="number"
                  min={0}
                  value={getShippingDraft(price.id, price.amountArs)}
                  onChange={(e) =>
                    setShippingDrafts((current) => ({
                      ...current,
                      [price.id]: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                className="mt-3"
                size="sm"
                disabled={updatingShipping}
                onClick={() => {
                  updateShippingPrice(
                    {
                      id: price.id,
                      amountArs: Number(getShippingDraft(price.id, price.amountArs)),
                    },
                    {
                      onSuccess: () => toast.success('Precio de envío actualizado'),
                      onError: (err) => {
                        toast.error(
                          (err.response as { data?: { message?: string } } | undefined)?.data
                            ?.message ?? 'Error al actualizar el envío'
                        )
                      },
                    }
                  )
                }}
              >
                {updatingShipping && <Spinner className="mr-2 size-4" />}
                Guardar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
