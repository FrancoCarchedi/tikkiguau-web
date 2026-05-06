import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { Order } from '../types/order'

async function fetchOrders(): Promise<Order[]> {
  const { data } = await axios.get('/api/orders')
  return data
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })
}
