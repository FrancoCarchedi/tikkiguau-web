import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { Store } from '../types/store'

async function fetchStores(): Promise<Store[]> {
  const { data } = await axios.get('/api/stores')
  return data
}

export function useStores() {
  return useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: fetchStores,
  })
}
