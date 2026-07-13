import type { CatalogEmojiDto } from '@/types/catalog'

const FALLBACK_EMOJI_META = [
  { key: 'patitas', label: 'Patitas', availableSizes: ['1', '2'] as const },
  { key: 'corazon', label: 'Corazón', availableSizes: ['1', '2'] as const },
  { key: 'estrella', label: 'Estrella', availableSizes: ['1', '2'] as const },
  { key: 'calavera', label: 'Calavera', availableSizes: ['1', '2'] as const },
  { key: 'energia', label: 'Energía', availableSizes: ['1', '2'] as const },
  { key: 'flor', label: 'Flor', availableSizes: ['1', '2'] as const },
  { key: 'luna', label: 'Luna', availableSizes: ['1', '2'] as const },
  { key: 'pez', label: 'Pez', availableSizes: ['1'] as const },
] as const

export function getFallbackEmojis(): CatalogEmojiDto[] {
  return FALLBACK_EMOJI_META.map((emoji, index) => ({
    id: `fallback-${emoji.key}`,
    key: emoji.key,
    label: emoji.label,
    svgMarkup: '',
    isActive: true,
    sortOrder: index,
    availableSizes: [...emoji.availableSizes],
    colorIds: [],
    colors: [],
  }))
}
