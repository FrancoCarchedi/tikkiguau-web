import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import {
  catalogQueryKeys,
  invalidateCatalogQueries,
} from '@/lib/catalog/query-keys'
import type { CatalogEmojiDto } from '@/types/catalog'

type CreateEmojiPayload = {
  key: string
  label: string
  svgMarkup: string
  sortOrder?: number
  colorIds?: string[]
  availableSizes?: Array<'1' | '2'>
}

type UpdateEmojiPayload = {
  id: string
  key?: string
  label?: string
  svgMarkup?: string
  isActive?: boolean
  sortOrder?: number
  colorIds?: string[]
  availableSizes?: Array<'1' | '2'>
}

async function fetchEmojis(): Promise<CatalogEmojiDto[]> {
  const { data } = await axios.get('/api/catalog/emojis')
  return data
}

async function createEmoji(payload: CreateEmojiPayload): Promise<CatalogEmojiDto> {
  const { data } = await axios.post('/api/catalog/emojis', payload)
  return data
}

async function updateEmoji({
  id,
  ...payload
}: UpdateEmojiPayload): Promise<CatalogEmojiDto> {
  const { data } = await axios.patch(`/api/catalog/emojis/${id}`, payload)
  return data
}

async function deleteEmoji(id: string): Promise<void> {
  await axios.delete(`/api/catalog/emojis/${id}`)
}

export function useCatalogEmojis() {
  return useQuery<CatalogEmojiDto[]>({
    queryKey: catalogQueryKeys.emojis,
    queryFn: fetchEmojis,
  })
}

export function useCreateCatalogEmoji() {
  const queryClient = useQueryClient()
  return useMutation<CatalogEmojiDto, AxiosError, CreateEmojiPayload>({
    mutationFn: createEmoji,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}

export function useUpdateCatalogEmoji() {
  const queryClient = useQueryClient()
  return useMutation<CatalogEmojiDto, AxiosError, UpdateEmojiPayload>({
    mutationFn: updateEmoji,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}

export function useDeleteCatalogEmoji() {
  const queryClient = useQueryClient()
  return useMutation<void, AxiosError, string>({
    mutationFn: deleteEmoji,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}
