import type { WholesaleCategory, WholesaleSizeValue } from '@/types/wholesale'

export const WHOLESALE_CATEGORIES: readonly WholesaleCategory[] = [
  'LETTER',
  'EMOJI',
  'COLLAR',
  'LEASH',
]

export const WHOLESALE_SIZES: readonly WholesaleSizeValue[] = ['2', '1']

export const CATEGORY_LABELS: Record<WholesaleCategory, string> = {
  LETTER: 'Letras',
  EMOJI: 'Emojis',
  COLLAR: 'Collares',
  LEASH: 'Correas',
}

export const CATEGORY_SINGULAR_LABELS: Record<WholesaleCategory, string> = {
  LETTER: 'letra',
  EMOJI: 'emoji',
  COLLAR: 'collar',
  LEASH: 'correa',
}

export const SIZE_SHORT_LABELS: Record<WholesaleSizeValue, string> = {
  '1': 'Pequeña',
  '2': 'Mediana',
}

export const SIZE_FULL_LABELS: Record<WholesaleSizeValue, string> = {
  '1': 'Talla 1 (Pequeña)',
  '2': 'Talla 2 (Mediana)',
}

/** Clave de ítem para productos lisos (collar / correa) sin elementos individuales. */
export const PLAIN_ITEM_KEY = 'plain'

export const MAX_UNITS_PER_ITEM = 9999

export const REFERENCE_MIN_LENGTH = 3
export const REFERENCE_MAX_LENGTH = 80
export const NOTES_MAX_LENGTH = 500

/** Largo máximo (ya codificado) de la URL de wa.me antes de usar el resumen breve. */
export const WHATSAPP_MAX_URL_LENGTH = 6000

export const WHOLESALE_SETTINGS_ID = 'default'

export const WHOLESALE_DRAFT_STORAGE_KEY = 'tikkiguau.wholesale.draft.v1'
