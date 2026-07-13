import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import {
  catalogQueryKeys,
  invalidateCatalogQueries,
} from '@/lib/catalog/query-keys'
import type { ProductPriceDto, ShippingPriceDto } from '@/types/catalog'

type UpdateProductPricePayload = {
  id: string
  amountArs?: number
  label?: string
  description?: string
  pieces?: number
}

type UpdateShippingPricePayload = {
  id: string
  amountArs: number
}

async function fetchProductPrices(): Promise<ProductPriceDto[]> {
  const { data } = await axios.get('/api/catalog/product-prices')
  return data
}

async function fetchShippingPrices(): Promise<ShippingPriceDto[]> {
  const { data } = await axios.get('/api/catalog/shipping-prices')
  return data
}

async function updateProductPrice({
  id,
  ...payload
}: UpdateProductPricePayload): Promise<ProductPriceDto> {
  const { data } = await axios.patch(`/api/catalog/product-prices/${id}`, payload)
  return data
}

async function updateShippingPrice({
  id,
  ...payload
}: UpdateShippingPricePayload): Promise<ShippingPriceDto> {
  const { data } = await axios.patch(`/api/catalog/shipping-prices/${id}`, payload)
  return data
}

export function useCatalogProductPrices() {
  return useQuery<ProductPriceDto[]>({
    queryKey: catalogQueryKeys.productPrices,
    queryFn: fetchProductPrices,
  })
}

export function useCatalogShippingPrices() {
  return useQuery<ShippingPriceDto[]>({
    queryKey: catalogQueryKeys.shippingPrices,
    queryFn: fetchShippingPrices,
  })
}

export function useUpdateCatalogProductPrice() {
  const queryClient = useQueryClient()
  return useMutation<ProductPriceDto, AxiosError, UpdateProductPricePayload>({
    mutationFn: updateProductPrice,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}

export function useUpdateCatalogShippingPrice() {
  const queryClient = useQueryClient()
  return useMutation<ShippingPriceDto, AxiosError, UpdateShippingPricePayload>({
    mutationFn: updateShippingPrice,
    onSuccess: () => invalidateCatalogQueries(queryClient),
  })
}
