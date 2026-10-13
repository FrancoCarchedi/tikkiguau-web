import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { wholesaleQueryKeys } from '@/lib/wholesale/query-keys'
import type { WholesaleOrderDto } from '@/types/wholesale'

async function fetchWholesaleOrders(): Promise<WholesaleOrderDto[]> {
  const { data } = await axios.get<WholesaleOrderDto[]>('/api/wholesale/orders')
  return data
}

export function useWholesaleOrders() {
  return useQuery<WholesaleOrderDto[]>({
    queryKey: wholesaleQueryKeys.orders,
    queryFn: fetchWholesaleOrders,
  })
}
