import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import type { Order, OrderStatus } from '../types/order'

type UpdateOrderPayload = {
  id: string
  status?: OrderStatus
  trackingCode?: string | null
}

async function updateOrder({ id, ...payload }: UpdateOrderPayload): Promise<Order> {
  const { data } = await axios.patch(`/api/orders/${id}`, payload)
  return data
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation<Order, AxiosError, UpdateOrderPayload>({
    mutationFn: updateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
