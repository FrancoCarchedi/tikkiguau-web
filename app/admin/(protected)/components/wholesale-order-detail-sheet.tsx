'use client'

import { useState } from 'react'
import { MessageCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { buildContactWhatsAppUrl } from '@/lib/wholesale/build-contact-whatsapp-url'
import { CATEGORY_SINGULAR_LABELS, SIZE_FULL_LABELS } from '@/lib/wholesale/constants'
import { formatWholesaleArs } from '@/lib/wholesale/format'
import type {
  WholesaleOrderDto,
  WholesaleOrderGroupSnapshot,
  WholesaleOrderStatus,
} from '@/types/wholesale'
import { useUpdateWholesaleOrder } from '../hooks/use-update-wholesale-order'
import {
  WHOLESALE_ORDER_STATUS_LABELS,
  WHOLESALE_ORDER_STATUS_OPTIONS,
  WholesaleOrderStatusBadge,
} from './wholesale-order-status-badge'

type Props = {
  order: WholesaleOrderDto | null
  open: boolean
  onClose: () => void
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

function OrderGroupCard({ group }: { group: WholesaleOrderGroupSnapshot }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-3 shrink-0 rounded-full border"
          style={{ backgroundColor: group.colorHex }}
          aria-hidden
        />
        <span className="font-semibold">
          {CATEGORY_SINGULAR_LABELS[group.category]} · {SIZE_FULL_LABELS[group.size]} ·{' '}
          {group.colorName}
        </span>
        <span className="ml-auto font-medium">{formatWholesaleArs(group.subtotalArs)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {group.units} u × {formatWholesaleArs(group.unitPriceArs)}
      </p>
      {group.items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {group.items.map((item) => (
            <span
              key={item.itemKey}
              className="rounded border bg-background px-2 py-0.5 text-xs"
            >
              <span className="font-mono font-medium">{item.label}</span>
              <span className="ml-1 text-muted-foreground">× {item.quantity}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function WholesaleOrderDetailSheet({ order, open, onClose }: Props) {
  const { mutate: updateOrder, isPending } = useUpdateWholesaleOrder()
  const [pendingStatus, setPendingStatus] = useState<WholesaleOrderStatus | null>(null)

  const status = pendingStatus ?? order?.status ?? 'NEW'
  const hasStatusChange = order !== null && status !== order.status
  const contactUrl = order ? buildContactWhatsAppUrl(order.phone) : null

  function handleClose() {
    setPendingStatus(null)
    onClose()
  }

  function handleSave() {
    if (!order || !hasStatusChange) {
      handleClose()
      return
    }

    updateOrder(
      { id: order.id, status },
      {
        onSuccess: () => {
          toast.success('Pedido actualizado correctamente')
          handleClose()
        },
        onError: () => toast.error('Error al actualizar el pedido. Intentá de nuevo.'),
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <SheetTitle className="font-mono text-base">{order?.orderNumber ?? ''}</SheetTitle>
            {order && <WholesaleOrderStatusBadge status={order.status} />}
          </div>
          <SheetDescription>
            Registrado el {order ? formatDate(order.createdAt) : ''}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex flex-col gap-6 px-6 py-6">
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Datos del cliente
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Referencia</span>
                <span className="font-medium">{order?.reference}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Teléfono</span>
                <span>{order?.phone}</span>
              </div>
            </div>
            {contactUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                nativeButton={false}
                render={<a href={contactUrl} target="_blank" rel="noopener noreferrer" />}
              >
                <MessageCircleIcon className="size-4" />
                Contactar por WhatsApp
              </Button>
            )}
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estado del pedido
            </h3>
            <Select value={status} onValueChange={(value) => setPendingStatus(value as WholesaleOrderStatus)}>
              <SelectTrigger className="w-48">
                <span className="flex-1 truncate text-left text-sm">
                  {WHOLESALE_ORDER_STATUS_LABELS[status]}
                </span>
              </SelectTrigger>
              <SelectContent>
                {WHOLESALE_ORDER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {WHOLESALE_ORDER_STATUS_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <Separator />

          <section className="flex items-center justify-between text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total estimado (sin envío)
            </h3>
            <span className="text-right">
              <span className="block text-base font-bold">
                {order ? formatWholesaleArs(order.totalAmountArs) : ''}
              </span>
              <span className="text-xs text-muted-foreground">{order?.totalUnits} unidades</span>
            </span>
          </section>

          {order?.notes && (
            <>
              <Separator />
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Notas del cliente
                </h3>
                <p className="whitespace-pre-wrap text-sm">{order.notes}</p>
              </section>
            </>
          )}

          <Separator />

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Detalle del pedido
            </h3>
            <div className="flex flex-col gap-2">
              {order && order.groups.length > 0 ? (
                order.groups.map((group) => (
                  <OrderGroupCard
                    key={`${group.category}-${group.size}-${group.colorHex}`}
                    group={group}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin detalle de productos.</p>
              )}
            </div>
          </section>
        </div>

        <div className="mt-auto flex justify-end gap-2 border-t bg-background px-6 py-4">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending || !hasStatusChange}>
            {isPending && <Spinner data-icon="inline-start" />}
            Guardar cambios
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
