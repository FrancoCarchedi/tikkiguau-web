'use client'

import { useMemo, useState } from 'react'
import { AlertCircleIcon, EyeIcon, XIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatWholesaleArs } from '@/lib/wholesale/format'
import type { WholesaleOrderStatus } from '@/types/wholesale'
import { useWholesaleOrders } from '../hooks/use-wholesale-orders'
import {
  WHOLESALE_ORDER_STATUS_LABELS,
  WHOLESALE_ORDER_STATUS_OPTIONS,
  WholesaleOrderStatusBadge,
} from './wholesale-order-status-badge'
import { WholesaleOrderDetailSheet } from './wholesale-order-detail-sheet'

type StatusFilter = WholesaleOrderStatus | 'all'

const TABLE_COLUMN_COUNT = 8

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function WholesaleOrdersTable() {
  const { data: orders, isLoading, isError } = useWholesaleOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all')

  const hasActiveFilters = search !== '' || filterStatus !== 'all'
  const selectedOrder = orders?.find((order) => order.id === selectedOrderId) ?? null
  const newOrdersCount = orders?.filter((order) => order.status === 'NEW').length ?? 0

  function clearFilters() {
    setSearch('')
    setFilterStatus('all')
  }

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    const query = search.trim().toLowerCase()

    return orders.filter((order) => {
      if (query) {
        const matches =
          order.orderNumber.toLowerCase().includes(query) ||
          order.reference.toLowerCase().includes(query) ||
          order.phone.toLowerCase().includes(query)
        if (!matches) return false
      }
      if (filterStatus !== 'all' && order.status !== filterStatus) return false
      return true
    })
  }, [orders, search, filterStatus])

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertDescription>
          Error al cargar los pedidos mayoristas. Por favor, recargá la página.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por pedido, referencia o teléfono…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-8 w-72"
        />

        <Select
          value={filterStatus}
          onValueChange={(value) => setFilterStatus((value as StatusFilter | null) ?? 'all')}
        >
          <SelectTrigger size="sm" className="w-40">
            <span
              className={cn(
                'flex-1 truncate text-left text-sm',
                filterStatus === 'all' && 'text-muted-foreground'
              )}
            >
              {filterStatus === 'all' ? 'Estado' : WHOLESALE_ORDER_STATUS_LABELS[filterStatus]}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {WHOLESALE_ORDER_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {WHOLESALE_ORDER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1.5 text-muted-foreground"
          >
            <XIcon className="size-3.5" />
            Limpiar
          </Button>
        )}

        {!isLoading && (
          <span className="ml-auto text-xs text-muted-foreground">
            {newOrdersCount > 0 && (
              <strong className="mr-3 text-amber-700">
                {newOrdersCount} nuevo{newOrdersCount === 1 ? '' : 's'}
              </strong>
            )}
            {filteredOrders.length} de {orders?.length ?? 0} pedido
            {orders?.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-27.5"># Pedido</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Unidades</TableHead>
              <TableHead>Total estimado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="whitespace-nowrap">Fecha</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: TABLE_COLUMN_COUNT }).map((__, columnIndex) => (
                    <TableCell key={columnIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMN_COUNT}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  {hasActiveFilters
                    ? 'No hay pedidos que coincidan con los filtros aplicados.'
                    : 'No hay pedidos mayoristas registrados aún.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <TableCell className="font-mono text-xs font-semibold">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell className="max-w-64 truncate font-medium">{order.reference}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {order.phone}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{order.totalUnits} u</TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatWholesaleArs(order.totalAmountArs)}
                  </TableCell>
                  <TableCell>
                    <WholesaleOrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedOrderId(order.id)
                      }}
                      aria-label="Ver detalle del pedido"
                    >
                      <EyeIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <WholesaleOrderDetailSheet
        order={selectedOrder}
        open={selectedOrder !== null}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  )
}
