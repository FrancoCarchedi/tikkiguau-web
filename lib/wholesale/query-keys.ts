export const wholesaleQueryKeys = {
  all: ['wholesale'] as const,
  settings: ['wholesale', 'settings'] as const,
  priceRules: ['wholesale', 'price-rules'] as const,
}

export function invalidateWholesaleQueries(queryClient: {
  invalidateQueries: (opts: { queryKey: readonly string[] }) => void
}) {
  queryClient.invalidateQueries({ queryKey: wholesaleQueryKeys.all })
}
