import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import { invalidateWholesaleQueries, wholesaleQueryKeys } from '@/lib/wholesale/query-keys'
import type { WholesalePriceRuleDto } from '@/types/wholesale'

export type UpdateWholesalePriceRulePayload = {
  id: string
  unitPriceArs?: number
  minUnitsPerColor?: number
  isActive?: boolean
}

async function fetchWholesalePriceRules(): Promise<WholesalePriceRuleDto[]> {
  const { data } = await axios.get<WholesalePriceRuleDto[]>('/api/wholesale/price-rules')
  return data
}

async function updateWholesalePriceRule({
  id,
  ...payload
}: UpdateWholesalePriceRulePayload): Promise<WholesalePriceRuleDto> {
  const { data } = await axios.patch<WholesalePriceRuleDto>(
    `/api/wholesale/price-rules/${id}`,
    payload
  )
  return data
}

export function useWholesalePriceRules() {
  return useQuery<WholesalePriceRuleDto[]>({
    queryKey: wholesaleQueryKeys.priceRules,
    queryFn: fetchWholesalePriceRules,
  })
}

export function useUpdateWholesalePriceRule() {
  const queryClient = useQueryClient()
  return useMutation<WholesalePriceRuleDto, AxiosError, UpdateWholesalePriceRulePayload>({
    mutationFn: updateWholesalePriceRule,
    onSuccess: () => invalidateWholesaleQueries(queryClient),
  })
}
