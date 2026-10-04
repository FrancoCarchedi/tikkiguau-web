'use client'

import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { TriangleAlertIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { getApiErrorMessage } from '@/lib/get-api-error-message'
import { wholesaleSettingsSchema } from '@/lib/wholesale/schemas'
import type { WholesaleSettingsDto } from '@/types/wholesale'
import { useUpdateWholesaleSettings, useWholesaleSettings } from '../hooks/use-wholesale-settings'

function SettingsForm({ settings }: { settings: WholesaleSettingsDto }) {
  const { mutate: updateSettings, isPending } = useUpdateWholesaleSettings()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<WholesaleSettingsDto>({
    resolver: zodResolver(wholesaleSettingsSchema),
    defaultValues: settings,
  })

  const requireUnits = useWatch({ control, name: 'requireMinTotalUnits' })
  const requireAmount = useWatch({ control, name: 'requireMinTotalAmount' })

  function onSubmit(values: WholesaleSettingsDto) {
    updateSettings(values, {
      onSuccess: (saved) => {
        toast.success('Ajustes mayoristas guardados')
        reset(saved)
      },
      onError: (error) =>
        toast.error(getApiErrorMessage(error, 'Error al guardar los ajustes mayoristas')),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de la sección</CardTitle>
          <CardDescription>
            Al deshabilitarla, /mayorista deja de mostrar el armador y se ocultan los enlaces del
            sitio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="isEnabled"
              render={({ field }) => (
                <Switch
                  id="wholesale-enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="wholesale-enabled">Venta mayorista habilitada</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requisitos para realizar el pedido</CardTitle>
          <CardDescription>
            Podés exigir un mínimo de unidades totales, un monto mínimo estimado, o ambos (el pedido
            debe cumplir los dos). Estos mínimos son independientes del mínimo por color.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px] sm:items-end">
            <div className="flex items-center gap-3">
              <Controller
                control={control}
                name="requireMinTotalUnits"
                render={({ field }) => (
                  <Switch
                    id="wholesale-require-units"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="wholesale-require-units">Exigir mínimo de unidades totales</Label>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wholesale-min-units">Unidades mínimas</Label>
              <Input
                id="wholesale-min-units"
                type="number"
                min={1}
                step={1}
                disabled={!requireUnits}
                aria-invalid={!!errors.minTotalUnits}
                {...register('minTotalUnits', { valueAsNumber: true })}
              />
              {errors.minTotalUnits && (
                <p className="text-xs text-destructive">{errors.minTotalUnits.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_200px] sm:items-end">
            <div className="flex items-center gap-3">
              <Controller
                control={control}
                name="requireMinTotalAmount"
                render={({ field }) => (
                  <Switch
                    id="wholesale-require-amount"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="wholesale-require-amount">Exigir monto mínimo total</Label>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wholesale-min-amount">Monto mínimo (ARS)</Label>
              <Input
                id="wholesale-min-amount"
                type="number"
                min={1}
                step={1}
                disabled={!requireAmount}
                aria-invalid={!!errors.minTotalAmountArs}
                {...register('minTotalAmountArs', { valueAsNumber: true })}
              />
              {errors.minTotalAmountArs && (
                <p className="text-xs text-destructive">{errors.minTotalAmountArs.message}</p>
              )}
            </div>
          </div>

          {!requireUnits && !requireAmount && (
            <Alert>
              <TriangleAlertIcon />
              <AlertDescription>
                Sin requisitos activos, se aceptará cualquier pedido con al menos una unidad (se
                siguen exigiendo los mínimos por color).
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div>
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending && <Spinner className="mr-2 size-4" />}
          Guardar ajustes
        </Button>
      </div>
    </form>
  )
}

export function WholesaleSettingsPanel() {
  const { data: settings, isLoading, isError } = useWholesaleSettings()

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando ajustes...</p>
  }

  if (isError || !settings) {
    return <p className="text-sm text-destructive">No se pudieron cargar los ajustes mayoristas.</p>
  }

  return <SettingsForm settings={settings} />
}
