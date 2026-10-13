import { z } from 'zod'
import type { WholesaleOrder } from '@/app/generated/prisma/client'
import type { WholesaleOrderDto, WholesaleOrderGroupSnapshot } from '@/types/wholesale'

const groupsSnapshotSchema = z.array(
  z.object({
    category: z.enum(['LETTER', 'EMOJI', 'COLLAR', 'LEASH']),
    size: z.enum(['1', '2']),
    colorHex: z.string(),
    colorName: z.string(),
    unitPriceArs: z.number(),
    units: z.number(),
    subtotalArs: z.number(),
    items: z.array(
      z.object({
        itemKey: z.string(),
        label: z.string(),
        quantity: z.number(),
      })
    ),
  })
)

function parseGroupsSnapshot(items: WholesaleOrder['items']): WholesaleOrderGroupSnapshot[] {
  const parsed = groupsSnapshotSchema.safeParse(items)
  return parsed.success ? parsed.data : []
}

export function mapWholesaleOrder(order: WholesaleOrder): WholesaleOrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    reference: order.reference,
    phone: order.phone,
    notes: order.notes,
    status: order.status,
    totalUnits: order.totalUnits,
    totalAmountArs: order.totalAmountArs,
    groups: parseGroupsSnapshot(order.items),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}
