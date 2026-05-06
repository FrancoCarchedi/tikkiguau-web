import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { Order } from '../types/order'
import { mockOrders } from '../data/mock-orders'

const USE_MOCK = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

async function fetchOrders(): Promise<Order[]> {
  if (USE_MOCK) return mockOrders
  const { data } = await axios.get('/api/orders')
  return data
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })
}
