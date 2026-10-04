import { z } from 'zod'
import type { PublicCatalogDto } from '@/types/catalog'
import type { PublicWholesaleConfig, WholesaleDraft, WholesaleOrderLine } from '@/types/wholesale'
import { isLineAvailable } from './catalog-options'
import {
  MAX_UNITS_PER_ITEM,
  NOTES_MAX_LENGTH,
  REFERENCE_MAX_LENGTH,
  WHOLESALE_DRAFT_STORAGE_KEY,
} from './constants'

const draftSchema = z.object({
  version: z.literal(1),
  reference: z.string().max(REFERENCE_MAX_LENGTH).default(''),
  notes: z.string().max(NOTES_MAX_LENGTH).default(''),
  lines: z.array(
    z.object({
      category: z.enum(['LETTER', 'EMOJI', 'COLLAR', 'LEASH']),
      size: z.enum(['1', '2']),
      colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      itemKey: z.string().min(1).max(50),
      quantity: z.number().int().min(1).max(MAX_UNITS_PER_ITEM),
    })
  ),
})

export const EMPTY_DRAFT: WholesaleDraft = { lines: [], reference: '', notes: '' }

/** Descarta líneas cuyo elemento, color, talla o categoría ya no están disponibles. */
export function pruneUnavailableLines(
  lines: WholesaleOrderLine[],
  catalog: PublicCatalogDto,
  config: PublicWholesaleConfig
): WholesaleOrderLine[] {
  return lines.filter((line) => isLineAvailable(line, catalog, config))
}

export function loadWholesaleDraft(
  catalog: PublicCatalogDto,
  config: PublicWholesaleConfig
): WholesaleDraft {
  try {
    const raw = window.localStorage.getItem(WHOLESALE_DRAFT_STORAGE_KEY)
    if (!raw) return EMPTY_DRAFT

    const parsed = draftSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return EMPTY_DRAFT

    return {
      reference: parsed.data.reference,
      notes: parsed.data.notes,
      lines: pruneUnavailableLines(parsed.data.lines, catalog, config),
    }
  } catch {
    return EMPTY_DRAFT
  }
}

export function saveWholesaleDraft(draft: WholesaleDraft): void {
  try {
    window.localStorage.setItem(
      WHOLESALE_DRAFT_STORAGE_KEY,
      JSON.stringify({ version: 1, ...draft })
    )
  } catch {
    // El almacenamiento puede estar bloqueado (modo privado, cuota): el armador sigue funcionando sin persistir.
  }
}

export function clearWholesaleDraft(): void {
  try {
    window.localStorage.removeItem(WHOLESALE_DRAFT_STORAGE_KEY)
  } catch {
    // Sin acción: ver saveWholesaleDraft.
  }
}
