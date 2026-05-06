import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import type { Store } from '../types/store'

type CreateStorePayload = {
  name: string
  keyword: string
}

async function createStore(payload: CreateStorePayload): Promise<Store> {
  const { data } = await axios.post('/api/stores', payload)
  return data
}

export function useCreateStore() {
  const queryClient = useQueryClient()

  return useMutation<Store, AxiosError, CreateStorePayload>({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}
