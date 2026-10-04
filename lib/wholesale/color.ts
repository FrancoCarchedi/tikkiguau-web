/** Luminancia percibida (0–255) para decidir si un color necesita fondo oscuro detrás. */
export function isLightColor(hexValue: string): boolean {
  const normalized = hexValue.replace('#', '')
  if (normalized.length !== 6) return false

  const red = parseInt(normalized.slice(0, 2), 16)
  const green = parseInt(normalized.slice(2, 4), 16)
  const blue = parseInt(normalized.slice(4, 6), 16)

  return (red * 299 + green * 587 + blue * 114) / 1000 > 200
}
