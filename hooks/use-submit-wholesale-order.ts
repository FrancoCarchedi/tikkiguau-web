import { useMutation } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import type {
  CreateWholesaleOrderPayload,
  CreateWholesaleOrderResult,
} from '@/types/wholesale'

async function submitWholesaleOrder(
  payload: CreateWholesaleOrderPayload
): Promise<CreateWholesaleOrderResult> {
  const { data } = await axios.post<CreateWholesaleOrderResult>('/api/wholesale/orders', payload)
  return data
}

export function useSubmitWholesaleOrder() {
  return useMutation<CreateWholesaleOrderResult, AxiosError, CreateWholesaleOrderPayload>({
    mutationFn: submitWholesaleOrder,
  })
}
