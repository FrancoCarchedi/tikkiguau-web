import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import {
  catalogQueryKeys,
  invalidateCatalogQueries,
} from '@/lib/catalog/query-keys'
import type { CatalogLetterDto } from '@/types/catalog'

type UpdateLetterPayload = {
  id: string
  isActive?: boolean
  sortOrder?: number
  colorIds?: string[]
}

async function fetchLetters(): Promise<CatalogLetterDto[]> {
  const { data } = await axios.get('/api/catalog/letters')
  return data
}

async function updateLetter({
  id,
  ...payload
}: UpdateLetterPayload): Promise<CatalogLetterDto> {
  const { data } = await axios.patch(`/api/catalog/letters/${id}`, payload)
  return data
}

export function useCatalogLetters() {
  return useQuery<CatalogLetterDto[]>({
    queryKey: catalogQueryKeys.letters,
    queryFn: fetchLetters,
  })
}

export function useUpdateCatalogLetter() {
  const queryClient = useQueryClient()
  return useMutation<CatalogLetterDto, AxiosError, UpdateLetterPayload>({
    mutationFn: updateLetter,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}
