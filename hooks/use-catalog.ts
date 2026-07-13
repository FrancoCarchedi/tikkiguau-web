'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { PublicCatalogDto } from '@/types/catalog'

async function fetchCatalog(): Promise<PublicCatalogDto> {
  const { data } = await axios.get<PublicCatalogDto>('/api/catalog')
  return data
}

export function useCatalog() {
  return useQuery<PublicCatalogDto>({
    queryKey: ['catalog'],
    queryFn: fetchCatalog,
    staleTime: 60_000,
  })
}
