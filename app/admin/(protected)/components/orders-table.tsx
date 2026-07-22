'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { EyeIcon, AlertCircleIcon, XIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useOrders } from '../hooks/use-orders'
import { useStores } from '../hooks/use-stores'
import type { Order } from '../types/order'
import { OrderStatusBadge } from './order-status-badge'
import { OrderDetailSheet } from './order-detail-sheet'

const deliveryLabels: Record<string, string> = {
  PICKUP: 'Retiro presencial',
  CORREO_DOMICILIO: 'Envío a domicilio',
  CORREO_SUCURSAL: 'Envío a sucursal',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  DELIVERED: 'Entregado',
}

function TriggerLabel({ value, placeholder }: { value: string; placeholder: string }) {
  const isPlaceholder = value === 'all'
  return (
    <span className={cn('flex-1 text-left text-sm truncate', isPlaceholder && 'text-muted-foreground')}>
      {isPlaceholder ? placeholder : value}
    </span>
  )
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function OrdersTable() {
  const { data: orders, isLoading, isError } = useOrders()
  const { data: stores } = useStores()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterStore, setFilterStore] = useState('all')
  const [filterDelivery, setFilterDelivery] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const hasActiveFilters = search !== '' || filterStore !== 'all' || filterDelivery !== 'all' || filterStatus !== 'all'

  function clearFilters() {
    setSearch('')
    setFilterStore('all')
    setFilterDelivery('all')
    setFilterStatus('all')
  }

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    const q = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (q) {
        const fullName = `${order.firstName} ${order.lastName}`.toLowerCase()
        const matches =
          order.orderNumber.toLowerCase().includes(q) ||
          fullName.includes(q) ||
          order.email.toLowerCase().includes(q) ||
          order.phone.toLowerCase().includes(q)
        if (!matches) return false
      }
      if (filterStore !== 'all') {
        if (filterStore === '__none__') {
          if (order.storeId !== null) return false
        } else {
          if (order.storeId !== filterStore) return false
        }
      }
      if (filterDelivery !== 'all' && order.deliveryMethod !== filterDelivery) return false
      if (filterStatus !== 'all' && order.status !== filterStatus) return false
      return true
    })
  }, [orders, search, filterStore, filterDelivery, filterStatus])

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertDescription>
          Error al cargar las órdenes. Por favor, recargá la página.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por orden, cliente, email o teléfono…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-72"
        />

        <Select value={filterStore} onValueChange={(v) => setFilterStore(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-40">
            <TriggerLabel
              placeholder="Tienda"
              value={
                filterStore === 'all' ? 'all'
                : filterStore === '__none__' ? 'Sin tienda'
                : stores?.find((s) => s.id === filterStore)?.name ?? 'Tienda'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las tiendas</SelectItem>
            <SelectItem value="__none__">Sin tienda</SelectItem>
            {stores?.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDelivery} onValueChange={(v) => setFilterDelivery(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-44">
            <TriggerLabel
              placeholder="Entrega"
              value={filterDelivery === 'all' ? 'all' : deliveryLabels[filterDelivery] ?? filterDelivery}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los envíos</SelectItem>
            <SelectItem value="PICKUP">Retiro presencial</SelectItem>
            <SelectItem value="CORREO_DOMICILIO">Envío a domicilio</SelectItem>
            <SelectItem value="CORREO_SUCURSAL">Envío a sucursal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-36">
            <TriggerLabel
              placeholder="Estado"
              value={filterStatus === 'all' ? 'all' : statusLabels[filterStatus] ?? filterStatus}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="APPROVED">Aprobado</SelectItem>
            <SelectItem value="REJECTED">Rechazado</SelectItem>
            <SelectItem value="DELIVERED">Entregado</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1.5 text-muted-foreground">
            <XIcon className="size-3.5" />
            Limpiar
          </Button>
        )}

        {!isLoading && (
          <span className="ml-auto text-xs text-muted-foreground">
            {filteredOrders.length} de {orders?.length ?? 0} orden{orders?.length === 1 ? '' : 'es'}
          </span>
        )}
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-27.5"># Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="whitespace-nowrap">Fecha</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filteredOrders.length === 0
              ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-16 text-center text-muted-foreground text-sm"
                    >
                      {hasActiveFilters ? 'No hay órdenes que coincidan con los filtros aplicados.' : 'No hay órdenes registradas aún.'}
                    </TableCell>
                  </TableRow>
                )
              : filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-mono font-semibold text-xs">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {order.firstName} {order.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {order.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {order.phone}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.store
                        ? <span className="font-medium">{order.store.name}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {deliveryLabels[order.deliveryMethod] ?? order.deliveryMethod}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrder(order)
                        }}
                        aria-label="Ver detalle de orden"
                      >
                        <EyeIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <OrderDetailSheet
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  )
}
