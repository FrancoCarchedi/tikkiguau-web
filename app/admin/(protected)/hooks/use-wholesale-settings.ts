import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import { invalidateWholesaleQueries, wholesaleQueryKeys } from '@/lib/wholesale/query-keys'
import type { WholesaleSettingsDto } from '@/types/wholesale'

async function fetchWholesaleSettings(): Promise<WholesaleSettingsDto> {
  const { data } = await axios.get<WholesaleSettingsDto>('/api/wholesale/settings')
  return data
}

async function updateWholesaleSettings(
  payload: Partial<WholesaleSettingsDto>
): Promise<WholesaleSettingsDto> {
  const { data } = await axios.patch<WholesaleSettingsDto>('/api/wholesale/settings', payload)
  return data
}

export function useWholesaleSettings() {
  return useQuery<WholesaleSettingsDto>({
    queryKey: wholesaleQueryKeys.settings,
    queryFn: fetchWholesaleSettings,
  })
}

export function useUpdateWholesaleSettings() {
  const queryClient = useQueryClient()
  return useMutation<WholesaleSettingsDto, AxiosError, Partial<WholesaleSettingsDto>>({
    mutationFn: updateWholesaleSettings,
    onSuccess: () => invalidateWholesaleQueries(queryClient),
  })
}
