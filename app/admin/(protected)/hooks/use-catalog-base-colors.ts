import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import {
  catalogQueryKeys,
  invalidateCatalogQueries,
} from '@/lib/catalog/query-keys'
import type { CatalogBaseColorDto } from '@/types/catalog'

type CreateBaseColorPayload = {
  name: string
  hexValue: string
  sortOrder?: number
}

type UpdateBaseColorPayload = {
  id: string
  name?: string
  hexValue?: string
  isActive?: boolean
  sortOrder?: number
}

async function fetchBaseColors(): Promise<CatalogBaseColorDto[]> {
  const { data } = await axios.get('/api/catalog/base-colors')
  return data
}

async function createBaseColor(
  payload: CreateBaseColorPayload
): Promise<CatalogBaseColorDto> {
  const { data } = await axios.post('/api/catalog/base-colors', payload)
  return data
}

async function updateBaseColor({
  id,
  ...payload
}: UpdateBaseColorPayload): Promise<CatalogBaseColorDto> {
  const { data } = await axios.patch(`/api/catalog/base-colors/${id}`, payload)
  return data
}

export function useCatalogBaseColors() {
  return useQuery<CatalogBaseColorDto[]>({
    queryKey: catalogQueryKeys.baseColors,
    queryFn: fetchBaseColors,
  })
}

export function useCreateCatalogBaseColor() {
  const queryClient = useQueryClient()
  return useMutation<CatalogBaseColorDto, AxiosError, CreateBaseColorPayload>({
    mutationFn: createBaseColor,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}

export function useUpdateCatalogBaseColor() {
  const queryClient = useQueryClient()
  return useMutation<CatalogBaseColorDto, AxiosError, UpdateBaseColorPayload>({
    mutationFn: updateBaseColor,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}
