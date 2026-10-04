import { WHATSAPP_URL } from '@/lib/payment-details'
import type {
  WholesaleCategory,
  WholesaleGroupEvaluation,
  WholesaleOrderEvaluation,
  WholesaleOrderLine,
} from '@/types/wholesale'
import {
  CATEGORY_LABELS,
  NOTES_MAX_LENGTH,
  PLAIN_ITEM_KEY,
  REFERENCE_MAX_LENGTH,
  SIZE_FULL_LABELS,
  WHATSAPP_MAX_URL_LENGTH,
} from './constants'
import { formatWholesaleArs } from './format'
import { buildGroupKey } from './order-calculator'

export interface WholesaleMessageInput {
  reference: string
  notes: string
  /** Líneas ya ordenadas con `sortWholesaleLines`. */
  lines: WholesaleOrderLine[]
  evaluation: WholesaleOrderEvaluation
  resolveColorName: (category: WholesaleCategory, colorHex: string) => string
  resolveItemLabel: (category: WholesaleCategory, itemKey: string) => string
}

export interface WholesaleWhatsAppPayload {
  url: string
  /** true cuando el mensaje completo no entra en la URL y se envía solo el resumen. */
  isSummaryOnly: boolean
  fullMessage: string
}

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function sanitizeReference(value: string): string {
  return value
    .replace(CONTROL_CHARACTERS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, REFERENCE_MAX_LENGTH)
}

export function sanitizeNotes(value: string): string {
  return value
    .replace(CONTROL_CHARACTERS, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, NOTES_MAX_LENGTH)
}

function buildItemsDetail(
  group: WholesaleGroupEvaluation,
  lines: WholesaleOrderLine[],
  resolveItemLabel: WholesaleMessageInput['resolveItemLabel']
): string {
  if (group.category === 'COLLAR' || group.category === 'LEASH') return ''

  const groupKey = buildGroupKey(group.category, group.size, group.colorHex)
  const items = lines
    .filter(
      (line) =>
        line.quantity > 0 &&
        line.itemKey !== PLAIN_ITEM_KEY &&
        buildGroupKey(line.category, line.size, line.colorHex) === groupKey
    )
    .map((line) => `${resolveItemLabel(line.category, line.itemKey)}×${line.quantity}`)

  return items.length > 0 ? ` → ${items.join(', ')}` : ''
}

function buildHeader(reference: string): string[] {
  return ['*Pedido mayorista TikkiGuau*', `Referencia: ${sanitizeReference(reference)}`]
}

function buildTotalLine(evaluation: WholesaleOrderEvaluation): string {
  return `*Total: ${evaluation.totalUnits} unidades · ${formatWholesaleArs(evaluation.totalAmountArs)} (estimado, sin envío)*`
}

export function buildWholesaleWhatsAppMessage(input: WholesaleMessageInput): string {
  const { evaluation, lines, resolveColorName, resolveItemLabel } = input
  const output: string[] = buildHeader(input.reference)

  let currentSectionKey = ''
  for (const group of evaluation.groups) {
    const sectionKey = `${group.category}|${group.size}`
    if (sectionKey !== currentSectionKey) {
      currentSectionKey = sectionKey
      output.push(
        '',
        `*${CATEGORY_LABELS[group.category]} · ${SIZE_FULL_LABELS[group.size]}* · ${formatWholesaleArs(group.unitPriceArs)} c/u`
      )
    }

    const colorName = resolveColorName(group.category, group.colorHex)
    output.push(
      `• ${colorName} · ${group.units} u · ${formatWholesaleArs(group.subtotalArs)}${buildItemsDetail(group, lines, resolveItemLabel)}`
    )
  }

  output.push('', buildTotalLine(evaluation))

  const notes = sanitizeNotes(input.notes)
  if (notes) {
    output.push('', `Notas: ${notes}`)
  }

  return output.join('\n')
}

export function buildWholesaleWhatsAppSummaryMessage(input: WholesaleMessageInput): string {
  return [
    ...buildHeader(input.reference),
    buildTotalLine(input.evaluation),
    '',
    'El detalle completo del pedido te lo pego a continuación.',
  ].join('\n')
}

export function buildWholesaleWhatsAppUrl(message: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`
}

export function resolveWhatsAppPayload(input: WholesaleMessageInput): WholesaleWhatsAppPayload {
  const fullMessage = buildWholesaleWhatsAppMessage(input)
  const fullUrl = buildWholesaleWhatsAppUrl(fullMessage)

  if (fullUrl.length <= WHATSAPP_MAX_URL_LENGTH) {
    return { url: fullUrl, isSummaryOnly: false, fullMessage }
  }

  return {
    url: buildWholesaleWhatsAppUrl(buildWholesaleWhatsAppSummaryMessage(input)),
    isSummaryOnly: true,
    fullMessage,
  }
}
