/** Formato ARS determinista (independiente del ICU del entorno): 22025 -> "$22.025". */
export function formatWholesaleArs(amountArs: number): string {
  const rounded = Math.round(amountArs)
  const sign = rounded < 0 ? '-' : ''
  const grouped = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}$${grouped}`
}

export function formatUnits(units: number): string {
  return `${units} u`
}
