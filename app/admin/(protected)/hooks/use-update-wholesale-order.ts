import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import { wholesaleQueryKeys } from '@/lib/wholesale/query-keys'
import type { WholesaleOrderDto, WholesaleOrderStatus } from '@/types/wholesale'

export type UpdateWholesaleOrderPayload = {
  id: string
  status: WholesaleOrderStatus
}

async function updateWholesaleOrder({
  id,
  ...payload
}: UpdateWholesaleOrderPayload): Promise<WholesaleOrderDto> {
  const { data } = await axios.patch<WholesaleOrderDto>(`/api/wholesale/orders/${id}`, payload)
  return data
}

export function useUpdateWholesaleOrder() {
  const queryClient = useQueryClient()

  return useMutation<WholesaleOrderDto, AxiosError, UpdateWholesaleOrderPayload>({
    mutationFn: updateWholesaleOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wholesaleQueryKeys.orders }),
  })
}
