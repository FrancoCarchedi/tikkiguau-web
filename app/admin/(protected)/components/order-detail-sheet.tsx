'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { OrderStatusBadge } from './order-status-badge'
import { useUpdateOrder } from '../hooks/use-update-order'
import { useResendOrderEmail } from '../hooks/use-resend-order-email'
import type { Order, OrderStatus } from '../types/order'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../types/order'

type Props = {
  order: Order | null
  open: boolean
  onClose: () => void
}

const deliveryLabels: Record<string, string> = {
  PICKUP: 'Retiro presencial',
  CORREO_DOMICILIO: 'Envío a domicilio',
  CORREO_SUCURSAL: 'Envío a sucursal',
}

type OrderItemElement = {
  type: 'letter' | 'emoji'
  value: string
  colorValue: string
  colorName: string
}

type ProductPart = {
  size: string
  colorValue: string
  colorName: string
  elements: OrderItemElement[]
}

type OrderItem = {
  productType: 'collar' | 'correa' | 'both'
  productLabel: string
  price: number
  collar?: ProductPart
  correa?: ProductPart
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  DELIVERED: 'Entregado',
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

function ProductPartCard({ label, part }: { label: string; part: ProductPart }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3 text-sm flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">— Talla {part.size.replace('Talla ', '')}</span>
        <span
          className="inline-block size-3 rounded-full border shrink-0 ml-auto"
          style={{ backgroundColor: part.colorValue }}
          title={part.colorName}
        />
        <span className="text-muted-foreground text-xs">{part.colorName}</span>
      </div>
      {part.elements.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {part.elements.map((el, i) => (
            <div
              key={i}
              className="flex items-center gap-1 rounded border bg-background px-2 py-0.5 text-xs"
            >
              <span
                className="inline-block size-2.5 rounded-full border shrink-0"
                style={{ backgroundColor: el.colorValue }}
              />
              <span className="font-mono font-medium">
                {el.type === 'letter' ? el.value : `[${el.value}]`}
              </span>
              <span className="text-muted-foreground">{el.colorName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OrderItemCard({ item }: { item: OrderItem }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{item.productLabel}</span>
        <span className="text-sm font-medium">{formatCurrency(item.price)}</span>
      </div>
      {item.collar && <ProductPartCard label="Collar" part={item.collar} />}
      {item.correa && <ProductPartCard label="Correa" part={item.correa} />}
    </div>
  )
}

export function OrderDetailSheet({ order, open, onClose }: Props) {
  const { mutate: updateOrder, isPending } = useUpdateOrder()
  const { mutate: resendEmail, isPending: isResending } = useResendOrderEmail()

  const [status, setStatus] = useState<OrderStatus>(order?.status ?? 'PENDING')
  const [trackingCode, setTrackingCode] = useState<string>(order?.trackingCode ?? '')

  useEffect(() => {
    if (order) {
      setStatus(order.status)
      setTrackingCode(order.trackingCode ?? '')
    }
  }, [order])

  function handleSave() {
    if (!order) return

    const payload: Parameters<typeof updateOrder>[0] = { id: order.id }
    if (status !== order.status) payload.status = status
    const newTracking = trackingCode.trim() || null
    if (newTracking !== order.trackingCode) payload.trackingCode = newTracking

    if (!payload.status && payload.trackingCode === undefined) {
      onClose()
      return
    }

    updateOrder(payload, {
      onSuccess: () => {
        toast.success('Orden actualizada correctamente')
        onClose()
      },
      onError: () => {
        toast.error('Error al actualizar la orden. Intentá de nuevo.')
      },
    })
  }

  function handleResendEmail() {
    if (!order) return
    resendEmail(order.id, {
      onSuccess: () => {
        toast.success('Email reenviado al cliente')
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ??
          'No se pudo reenviar el email. Revisá la configuración de Resend.'
        toast.error(message)
      },
    })
  }

  const orderItems = (() => {
    try {
      return Array.isArray(order?.orderItems)
        ? (order.orderItems as OrderItem[])
        : (JSON.parse(order?.orderItems as string ?? '[]') as OrderItem[])
    } catch {
      return []
    }
  })()

  const showShipping = order?.deliveryMethod !== 'PICKUP'

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="font-mono text-base">
              {order?.orderNumber ?? ''}
            </SheetTitle>
            {order && <OrderStatusBadge status={order.status} />}
          </div>
          <SheetDescription>
            Creada el {order ? formatDate(order.createdAt) : ''}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex flex-col gap-6 px-6 py-6">

          {/* Cliente */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Datos del cliente
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Nombre</span>
                <span className="font-medium">
                  {order?.firstName} {order?.lastName}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">DNI</span>
                <span>{order?.dni ?? '—'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Teléfono</span>
                <span>{order?.phone}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Email</span>
                <span>{order?.email}</span>
              </div>
            </div>
          </section>

          {order?.store && (
            <>
              <Separator />
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tienda origen
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Nombre</span>
                    <span className="font-medium">{order.store.name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Palabra clave</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono w-fit">
                      {order.store.keyword}
                    </code>
                  </div>
                </div>
              </section>
            </>
          )}

          <Separator />

          {/* Envío */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Datos de envío
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Tipo de entrega</span>
                <Badge variant="outline" className="w-fit text-xs">
                  {order ? deliveryLabels[order.deliveryMethod] : ''}
                </Badge>
              </div>

              {showShipping && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Dirección</span>
                    <span>{order?.address ?? '—'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Provincia</span>
                    <span>{order?.province ?? '—'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Localidad</span>
                    <span>{order?.city ?? '—'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Código Postal</span>
                    <span>{order?.zipCode ?? '—'}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trackingCode" className="text-xs text-muted-foreground">
                  Código de seguimiento
                </Label>
                <Input
                  id="trackingCode"
                  placeholder="Ej: SP123456789AR"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="font-mono text-sm h-8"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Estado */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estado del pedido
            </h3>
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger className="w-48">
                <span className="flex-1 text-left text-sm truncate">
                  {statusLabels[status] ?? status}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="APPROVED">Aprobado</SelectItem>
                <SelectItem value="REJECTED">Rechazado</SelectItem>
                <SelectItem value="DELIVERED">Entregado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={handleResendEmail}
              disabled={!order || isResending || isPending}
            >
              {isResending && <Spinner data-icon="inline-start" />}
              Reenviar email con el último estado
            </Button>
          </section>

          <Separator />

          {/* Pago */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pago
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Método</p>
                <p className="font-medium">
                  {order
                    ? PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                      order.paymentMethod
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado de pago</p>
                <p className="font-medium">
                  {order
                    ? PAYMENT_STATUS_LABELS[order.paymentStatus] ??
                      order.paymentStatus
                    : '—'}
                </p>
              </div>
              {order && order.paymentSurchargeAmount > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Recargo MP</p>
                  <p className="font-medium">
                    {formatCurrency(order.paymentSurchargeAmount)}
                  </p>
                </div>
              )}
              {order?.mpPaymentId && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-xs break-all">{order.mpPaymentId}</p>
                </div>
              )}
              {order?.mpPreferenceId && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Preference ID</p>
                  <p className="font-mono text-xs break-all">{order.mpPreferenceId}</p>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Total */}
          <section className="flex items-center justify-between text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total de la orden
            </h3>
            <span className="text-base font-bold">
              {order ? formatCurrency(order.totalAmount) : ''}
            </span>
          </section>

          <Separator />

          {/* Productos */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Detalle de compra
            </h3>
            <div className="flex flex-col gap-2">
              {orderItems.length > 0
                ? orderItems.map((item, i) => <OrderItemCard key={i} item={item} />)
                : (
                    <p className="text-sm text-muted-foreground">
                      Sin detalle de productos.
                    </p>
                  )}
            </div>
          </section>
        </div>

        <div className="mt-auto border-t bg-background px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            Guardar cambios
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
