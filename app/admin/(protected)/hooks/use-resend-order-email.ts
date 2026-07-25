import { useMutation } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'

async function resendOrderEmail(id: string): Promise<{ ok: true }> {
  const { data } = await axios.post<{ ok: true }>(`/api/orders/${id}/resend-email`)
  return data
}

export function useResendOrderEmail() {
  return useMutation<{ ok: true }, AxiosError<{ message?: string }>, string>({
    mutationFn: resendOrderEmail,
  })
}
