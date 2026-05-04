import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import type { SignInFormValues } from '../schemas/auth-schema'

interface SignInErrorResponse {
  message: string
}

async function signInRequest(credentials: SignInFormValues) {
  const { data } = await axios.post('/api/auth/sign-in/email', credentials)
  return data
}

export function useSignIn() {
  const router = useRouter()

  return useMutation<unknown, AxiosError<SignInErrorResponse>, SignInFormValues>({
    mutationFn: signInRequest,
    onSuccess: () => {
      router.push('/admin')
    },
  })
}
