import type { PublicCatalogDto } from '@/types/catalog'
import type {
  PublicWholesaleConfig,
  WholesaleOrderGroupSnapshot,
  WholesaleOrderLine,
} from '@/types/wholesale'
import {
  buildSortContext,
  getColorName,
  getItemLabel,
  isLineAvailable,
} from './catalog-options'
import { PLAIN_ITEM_KEY } from './constants'
import {
  buildGroupKey,
  evaluateWholesaleOrder,
  isSameLine,
  sortWholesaleLines,
} from './order-calculator'

export interface PreparedWholesaleOrder {
  totalUnits: number
  totalAmountArs: number
  groups: WholesaleOrderGroupSnapshot[]
}

export type PrepareWholesaleOrderResult =
  | { isValid: true; order: PreparedWholesaleOrder }
  | { isValid: false; message: string }

interface PrepareWholesaleOrderParams {
  lines: WholesaleOrderLine[]
  catalog: PublicCatalogDto
  config: PublicWholesaleConfig
}

function hasDuplicatedLines(lines: WholesaleOrderLine[]): boolean {
  return lines.some((line, index) => lines.findIndex((other) => isSameLine(other, line)) !== index)
}

/**
 * Recalcula el pedido con la configuración y el catálogo vigentes. El cliente nunca aporta
 * precios ni totales: todo lo que se guarda sale de acá.
 */
export function prepareWholesaleOrder({
  lines,
  catalog,
  config,
}: PrepareWholesaleOrderParams): PrepareWholesaleOrderResult {
  if (!config.settings.isEnabled) {
    return { isValid: false, message: 'La venta mayorista no está disponible en este momento' }
  }

  if (hasDuplicatedLines(lines)) {
    return { isValid: false, message: 'El pedido tiene ítems repetidos. Revisalo e intentá de nuevo.' }
  }

  if (!lines.every((line) => isLineAvailable(line, catalog, config))) {
    return {
      isValid: false,
      message:
        'Algunos productos de tu pedido ya no están disponibles. Actualizá la página y revisá tu pedido.',
    }
  }

  const sortedLines = sortWholesaleLines(lines, buildSortContext(catalog))
  const evaluation = evaluateWholesaleOrder(sortedLines, config)

  if (!evaluation.isValid) {
    return { isValid: false, message: evaluation.blockingReasons.join('. ') }
  }

  const groups = evaluation.groups.map<WholesaleOrderGroupSnapshot>((group) => {
    const groupKey = buildGroupKey(group.category, group.size, group.colorHex)

    return {
      category: group.category,
      size: group.size,
      colorHex: group.colorHex,
      colorName: getColorName(catalog, group.category, group.colorHex),
      unitPriceArs: group.unitPriceArs,
      units: group.units,
      subtotalArs: group.subtotalArs,
      items: sortedLines
        .filter(
          (line) =>
            line.itemKey !== PLAIN_ITEM_KEY &&
            buildGroupKey(line.category, line.size, line.colorHex) === groupKey
        )
        .map((line) => ({
          itemKey: line.itemKey,
          label: getItemLabel(catalog, line.category, line.itemKey),
          quantity: line.quantity,
        })),
    }
  })

  return {
    isValid: true,
    order: {
      totalUnits: evaluation.totalUnits,
      totalAmountArs: evaluation.totalAmountArs,
      groups,
    },
  }
}
