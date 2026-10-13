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
  phone: string
  notes: string
}

export type WholesaleOrderStatus = 'NEW' | 'CONTACTED' | 'CLOSED' | 'CANCELLED'

export interface WholesaleOrderItemSnapshot {
  itemKey: string
  label: string
  quantity: number
}

export interface WholesaleOrderGroupSnapshot {
  category: WholesaleCategory
  size: WholesaleSizeValue
  colorHex: string
  colorName: string
  unitPriceArs: number
  units: number
  subtotalArs: number
  /** Vacío para collares y correas (se venden lisos). */
  items: WholesaleOrderItemSnapshot[]
}

export interface WholesaleOrderDto {
  id: string
  orderNumber: string
  reference: string
  phone: string
  notes: string | null
  status: WholesaleOrderStatus
  totalUnits: number
  totalAmountArs: number
  groups: WholesaleOrderGroupSnapshot[]
  createdAt: string
  updatedAt: string
}

export interface CreateWholesaleOrderPayload {
  reference: string
  phone: string
  notes: string
  lines: WholesaleOrderLine[]
}

export interface CreateWholesaleOrderResult {
  id: string
  orderNumber: string
}

/** Estado en memoria del pedido ya guardado, usado por la pantalla "Pedido registrado". */
export interface SubmittedWholesaleOrder {
  orderNumber: string
  reference: string
  totalUnits: number
  totalAmountArs: number
  whatsappUrl: string
  /** true cuando el mensaje completo no entra en la URL y WhatsApp recibe solo un resumen. */
  isSummaryOnly: boolean
  fullMessage: string
  wasWhatsAppOpened: boolean
}
