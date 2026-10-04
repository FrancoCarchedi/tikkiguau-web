import type {
  PublicWholesaleConfig,
  WholesaleCategory,
  WholesaleGroupEvaluation,
  WholesaleOrderEvaluation,
  WholesaleOrderLine,
  WholesalePriceRuleDto,
  WholesaleRequirementProgress,
  WholesaleSizeValue,
} from '@/types/wholesale'
import { WHOLESALE_CATEGORIES, WHOLESALE_SIZES } from './constants'
import { formatWholesaleArs } from './format'

export interface WholesaleSortContext {
  colorIndex: (category: WholesaleCategory, colorHex: string) => number
  itemIndex: (category: WholesaleCategory, itemKey: string) => number
}

export function findPriceRule(
  priceRules: WholesalePriceRuleDto[],
  category: WholesaleCategory,
  size: WholesaleSizeValue
): WholesalePriceRuleDto | undefined {
  return priceRules.find((rule) => rule.category === category && rule.size === size)
}

export function buildGroupKey(
  category: WholesaleCategory,
  size: WholesaleSizeValue,
  colorHex: string
): string {
  return `${category}|${size}|${colorHex.toUpperCase()}`
}

export function isSameLine(
  line: WholesaleOrderLine,
  other: Pick<WholesaleOrderLine, 'category' | 'size' | 'colorHex' | 'itemKey'>
): boolean {
  return (
    line.category === other.category &&
    line.size === other.size &&
    line.colorHex.toUpperCase() === other.colorHex.toUpperCase() &&
    line.itemKey === other.itemKey
  )
}

/** Orden determinista: categoría → talla (mediana primero) → color → ítem. */
export function sortWholesaleLines(
  lines: WholesaleOrderLine[],
  context: WholesaleSortContext
): WholesaleOrderLine[] {
  return [...lines].sort((a, b) => {
    const categoryDiff =
      WHOLESALE_CATEGORIES.indexOf(a.category) - WHOLESALE_CATEGORIES.indexOf(b.category)
    if (categoryDiff !== 0) return categoryDiff

    const sizeDiff = WHOLESALE_SIZES.indexOf(a.size) - WHOLESALE_SIZES.indexOf(b.size)
    if (sizeDiff !== 0) return sizeDiff

    const colorDiff =
      context.colorIndex(a.category, a.colorHex) - context.colorIndex(b.category, b.colorHex)
    if (colorDiff !== 0) return colorDiff

    return context.itemIndex(a.category, a.itemKey) - context.itemIndex(b.category, b.itemKey)
  })
}

function buildRequirementProgress(required: number, current: number): WholesaleRequirementProgress {
  return {
    required,
    current,
    missing: Math.max(0, required - current),
    isMet: current >= required,
  }
}

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 0
  return Math.max(0, Math.floor(quantity))
}

export function evaluateWholesaleOrder(
  lines: WholesaleOrderLine[],
  config: PublicWholesaleConfig
): WholesaleOrderEvaluation {
  const groupsByKey = new Map<string, WholesaleGroupEvaluation>()

  for (const line of lines) {
    const quantity = normalizeQuantity(line.quantity)
    if (quantity === 0) continue

    const rule = findPriceRule(config.priceRules, line.category, line.size)
    if (!rule) continue

    const key = buildGroupKey(line.category, line.size, line.colorHex)
    const existing = groupsByKey.get(key)

    if (existing) {
      existing.units += quantity
      continue
    }

    groupsByKey.set(key, {
      category: line.category,
      size: line.size,
      colorHex: line.colorHex,
      units: quantity,
      unitPriceArs: rule.unitPriceArs,
      subtotalArs: 0,
      minUnitsPerColor: rule.minUnitsPerColor,
      missingUnits: 0,
    })
  }

  const groups = [...groupsByKey.values()]
  for (const group of groups) {
    group.subtotalArs = group.units * group.unitPriceArs
    group.missingUnits = Math.max(0, group.minUnitsPerColor - group.units)
  }

  const totalUnits = groups.reduce((sum, group) => sum + group.units, 0)
  const totalAmountArs = groups.reduce((sum, group) => sum + group.subtotalArs, 0)

  const { settings } = config
  const unitsRequirement = settings.requireMinTotalUnits
    ? buildRequirementProgress(settings.minTotalUnits, totalUnits)
    : null
  const amountRequirement = settings.requireMinTotalAmount
    ? buildRequirementProgress(settings.minTotalAmountArs, totalAmountArs)
    : null

  const blockingReasons: string[] = []

  if (totalUnits === 0) {
    blockingReasons.push('Agregá al menos una unidad a tu pedido')
  }

  const groupsBelowMinimum = groups.filter((group) => group.missingUnits > 0)
  if (groupsBelowMinimum.length > 0) {
    blockingReasons.push(
      groupsBelowMinimum.length === 1
        ? 'Hay 1 color por debajo del mínimo por color'
        : `Hay ${groupsBelowMinimum.length} colores por debajo del mínimo por color`
    )
  }

  if (totalUnits > 0 && unitsRequirement && !unitsRequirement.isMet) {
    blockingReasons.push(`Faltan ${unitsRequirement.missing} unidades para el mínimo del pedido`)
  }

  if (totalUnits > 0 && amountRequirement && !amountRequirement.isMet) {
    blockingReasons.push(
      `Faltan ${formatWholesaleArs(amountRequirement.missing)} para el monto mínimo del pedido`
    )
  }

  return {
    totalUnits,
    totalAmountArs,
    groups,
    unitsRequirement,
    amountRequirement,
    blockingReasons,
    isValid: blockingReasons.length === 0,
  }
}

export function getGroupUnits(
  evaluation: WholesaleOrderEvaluation,
  category: WholesaleCategory,
  size: WholesaleSizeValue,
  colorHex: string
): number {
  const key = buildGroupKey(category, size, colorHex)
  return (
    evaluation.groups.find((group) => buildGroupKey(group.category, group.size, group.colorHex) === key)
      ?.units ?? 0
  )
}
