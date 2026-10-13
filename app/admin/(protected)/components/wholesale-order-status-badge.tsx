'use client'

import { Badge } from '@/components/ui/badge'
import type { WholesaleOrderStatus } from '@/types/wholesale'

export const WHOLESALE_ORDER_STATUS_LABELS: Record<WholesaleOrderStatus, string> = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
}

export const WHOLESALE_ORDER_STATUS_OPTIONS: readonly WholesaleOrderStatus[] = [
  'NEW',
  'CONTACTED',
  'CLOSED',
  'CANCELLED',
]

const STATUS_CLASS_NAMES: Record<WholesaleOrderStatus, string> = {
  NEW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  CONTACTED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  CLOSED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
}

export function WholesaleOrderStatusBadge({ status }: { status: WholesaleOrderStatus }) {
  return (
    <Badge variant="outline" className={STATUS_CLASS_NAMES[status]}>
      {WHOLESALE_ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}
