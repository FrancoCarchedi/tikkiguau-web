import axios from 'axios'

/** Extrae el `message` que devuelven nuestras API routes; cae al texto indicado si no existe. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }
  return fallback
}
