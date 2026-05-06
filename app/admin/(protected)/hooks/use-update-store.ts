import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import type { Store } from '../types/store'

type UpdateStorePayload = {
  id: string
  name?: string
  keyword?: string
  isActive?: boolean
}

async function updateStore({ id, ...payload }: UpdateStorePayload): Promise<Store> {
  const { data } = await axios.patch(`/api/stores/${id}`, payload)
  return data
}

export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation<Store, AxiosError, UpdateStorePayload>({
    mutationFn: updateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}
