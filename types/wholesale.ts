export type WholesaleCategory = 'LETTER' | 'EMOJI' | 'COLLAR' | 'LEASH'

export type WholesaleSizeValue = '1' | '2'

export interface WholesalePriceRuleDto {
  id: string
  category: WholesaleCategory
  size: WholesaleSizeValue
  unitPriceArs: number
  minUnitsPerColor: number
  isActive: boolean
}

export interface WholesaleSettingsDto {
  isEnabled: boolean
  requireMinTotalUnits: boolean
  minTotalUnits: number
  requireMinTotalAmount: boolean
  minTotalAmountArs: number
}

export interface PublicWholesaleConfig {
  settings: WholesaleSettingsDto
  /** Solo reglas activas. */
  priceRules: WholesalePriceRuleDto[]
}

export interface WholesaleOrderLine {
  category: WholesaleCategory
  size: WholesaleSizeValue
  colorHex: string
  /** Letra, key de emoji, o 'plain' para collares y correas. */
  itemKey: string
  quantity: number
}

export interface WholesaleGroupEvaluation {
  category: WholesaleCategory
  size: WholesaleSizeValue
  colorHex: string
  units: number
  unitPriceArs: number
  subtotalArs: number
  minUnitsPerColor: number
  /** Unidades que faltan para cumplir el mínimo por color (0 si cumple). */
  missingUnits: number
}

export interface WholesaleRequirementProgress {
  required: number
  current: number
  missing: number
  isMet: boolean
}

export interface WholesaleOrderEvaluation {
  totalUnits: number
  totalAmountArs: number
  groups: WholesaleGroupEvaluation[]
  /** null cuando el requisito está desactivado en el CMS. */
  unitsRequirement: WholesaleRequirementProgress | null
  amountRequirement: WholesaleRequirementProgress | null
  blockingReasons: string[]
  isValid: boolean
}

export interface WholesaleDraft {
  lines: WholesaleOrderLine[]
  reference: string
  notes: string
}
