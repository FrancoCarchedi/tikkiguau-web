'use client'

import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiErrorMessage } from '@/lib/get-api-error-message'
import { CATEGORY_LABELS, SIZE_FULL_LABELS } from '@/lib/wholesale/constants'
import {
  wholesalePriceRulesFormSchema,
  type WholesalePriceRulesFormValues,
} from '@/lib/wholesale/schemas'
import type { WholesalePriceRuleDto } from '@/types/wholesale'
import {
  useUpdateWholesalePriceRule,
  useWholesalePriceRules,
} from '../hooks/use-wholesale-price-rules'

function toFormValues(rules: WholesalePriceRuleDto[]): WholesalePriceRulesFormValues {
  return {
    rules: rules.map(({ id, unitPriceArs, minUnitsPerColor, isActive }) => ({
      id,
      unitPriceArs,
      minUnitsPerColor,
      isActive,
    })),
  }
}

function PriceRulesForm({ rules }: { rules: WholesalePriceRuleDto[] }) {
  const { mutateAsync: updateRule } = useUpdateWholesalePriceRule()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<WholesalePriceRulesFormValues>({
    resolver: zodResolver(wholesalePriceRulesFormSchema),
    defaultValues: toFormValues(rules),
  })
  const { fields } = useFieldArray({ control, name: 'rules', keyName: 'fieldKey' })

  async function onSubmit(values: WholesalePriceRulesFormValues) {
    const changedRules = values.rules.filter((formRule) => {
      const original = rules.find((rule) => rule.id === formRule.id)
      return (
        !original ||
        original.unitPriceArs !== formRule.unitPriceArs ||
        original.minUnitsPerColor !== formRule.minUnitsPerColor ||
        original.isActive !== formRule.isActive
      )
    })

    try {
      await Promise.all(changedRules.map((rule) => updateRule(rule)))
      toast.success('Precios y mínimos guardados')
      reset(values)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Error al guardar los precios mayoristas'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Precios y mínimos por categoría y talla</CardTitle>
          <CardDescription>
            Precio unitario en ARS y cantidad mínima por color (se suma entre todos los ítems de la
            misma categoría, talla y color). Un mínimo de 0 desactiva la exigencia. Una fila inactiva
            no se ofrece en /mayorista.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Talla</TableHead>
                  <TableHead className="w-40">Precio unitario (ARS)</TableHead>
                  <TableHead className="w-40">Mínimo por color (u)</TableHead>
                  <TableHead className="w-24">Activo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const rule = rules.find((entry) => entry.id === field.id)
                  if (!rule) return null
                  const rowErrors = errors.rules?.[index]

                  return (
                    <TableRow key={field.fieldKey}>
                      <TableCell className="font-medium">{CATEGORY_LABELS[rule.category]}</TableCell>
                      <TableCell>{SIZE_FULL_LABELS[rule.size]}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          aria-label={`Precio de ${CATEGORY_LABELS[rule.category]} ${SIZE_FULL_LABELS[rule.size]}`}
                          aria-invalid={!!rowErrors?.unitPriceArs}
                          {...register(`rules.${index}.unitPriceArs`, { valueAsNumber: true })}
                        />
                        {rowErrors?.unitPriceArs && (
                          <p className="mt-1 text-xs text-destructive">
                            {rowErrors.unitPriceArs.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          aria-label={`Mínimo por color de ${CATEGORY_LABELS[rule.category]} ${SIZE_FULL_LABELS[rule.size]}`}
                          aria-invalid={!!rowErrors?.minUnitsPerColor}
                          {...register(`rules.${index}.minUnitsPerColor`, { valueAsNumber: true })}
                        />
                        {rowErrors?.minUnitsPerColor && (
                          <p className="mt-1 text-xs text-destructive">
                            {rowErrors.minUnitsPerColor.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={control}
                          name={`rules.${index}.isActive`}
                          render={({ field: switchField }) => (
                            <Switch
                              checked={switchField.value}
                              onCheckedChange={switchField.onChange}
                              aria-label={`Activar ${CATEGORY_LABELS[rule.category]} ${SIZE_FULL_LABELS[rule.size]}`}
                            />
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Spinner className="mr-2 size-4" />}
              Guardar precios y mínimos
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export function WholesalePriceRulesPanel() {
  const { data: rules, isLoading, isError } = useWholesalePriceRules()

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando precios...</p>
  }

  if (isError || !rules) {
    return <p className="text-sm text-destructive">No se pudieron cargar los precios mayoristas.</p>
  }

  return <PriceRulesForm rules={rules} />
}
