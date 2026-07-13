export const catalogQueryKeys = {
  all: ['catalog'] as const,
  baseColors: ['catalog', 'base-colors'] as const,
  elementColors: ['catalog', 'element-colors'] as const,
  letters: ['catalog', 'letters'] as const,
  emojis: ['catalog', 'emojis'] as const,
  productPrices: ['catalog', 'product-prices'] as const,
  shippingPrices: ['catalog', 'shipping-prices'] as const,
}

export function invalidateCatalogQueries(queryClient: {
  invalidateQueries: (opts: { queryKey: readonly string[] }) => void
}) {
  queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all })
  queryClient.invalidateQueries({ queryKey: catalogQueryKeys.baseColors })
  queryClient.invalidateQueries({ queryKey: catalogQueryKeys.elementColors })
  queryClient.invalidateQueries({ queryKey: catalogQueryKeys.letters })
  queryClient.invalidateQueries({ queryKey: catalogQueryKeys.emojis })
  queryClient.invalidateQueries({ queryKey: catalogQueryKeys.productPrices })
  queryClient.invalidateQueries({ queryKey: catalogQueryKeys.shippingPrices })
}
