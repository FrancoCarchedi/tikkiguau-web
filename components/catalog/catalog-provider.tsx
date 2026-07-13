'use client'

import { createContext, useContext } from 'react'
import type { PublicCatalogDto } from '@/types/catalog'

const CatalogContext = createContext<PublicCatalogDto | null>(null)

export function CatalogProvider({
  catalog,
  children,
}: {
  catalog: PublicCatalogDto
  children: React.ReactNode
}) {
  return (
    <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
  )
}

export function useCatalogContext(): PublicCatalogDto | null {
  return useContext(CatalogContext)
}

export function useRequiredCatalog(): PublicCatalogDto {
  const catalog = useContext(CatalogContext)
  if (!catalog) {
    throw new Error('useRequiredCatalog debe usarse dentro de CatalogProvider')
  }
  return catalog
}
