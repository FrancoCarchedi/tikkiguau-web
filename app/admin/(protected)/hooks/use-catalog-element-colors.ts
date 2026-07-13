import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import {
  catalogQueryKeys,
  invalidateCatalogQueries,
} from '@/lib/catalog/query-keys'
import type { CatalogElementColorDto } from '@/types/catalog'

type CreateElementColorPayload = {
  hexValue: string
  sortOrder?: number
}

type UpdateElementColorPayload = {
  id: string
  hexValue?: string
  isActive?: boolean
  sortOrder?: number
}

async function fetchElementColors(): Promise<CatalogElementColorDto[]> {
  const { data } = await axios.get('/api/catalog/element-colors')
  return data
}

async function createElementColor(
  payload: CreateElementColorPayload
): Promise<CatalogElementColorDto> {
  const { data } = await axios.post('/api/catalog/element-colors', payload)
  return data
}

async function updateElementColor({
  id,
  ...payload
}: UpdateElementColorPayload): Promise<CatalogElementColorDto> {
  const { data } = await axios.patch(`/api/catalog/element-colors/${id}`, payload)
  return data
}

export function useCatalogElementColors() {
  return useQuery<CatalogElementColorDto[]>({
    queryKey: catalogQueryKeys.elementColors,
    queryFn: fetchElementColors,
  })
}

export function useCreateCatalogElementColor() {
  const queryClient = useQueryClient()
  return useMutation<CatalogElementColorDto, AxiosError, CreateElementColorPayload>({
    mutationFn: createElementColor,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}

export function useUpdateCatalogElementColor() {
  const queryClient = useQueryClient()
  return useMutation<CatalogElementColorDto, AxiosError, UpdateElementColorPayload>({
    mutationFn: updateElementColor,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}
