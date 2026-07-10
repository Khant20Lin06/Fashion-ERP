import { apiClient } from "@/lib/api/client"
import type { Brand, Collection } from "../types"
import type { BrandFormValues } from "../schemas/product.schema"
import { mockBrands, mockCollections } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchBrands(): Promise<Brand[]> {
  if (USE_MOCK) return delay(mockBrands)
  const { data } = await apiClient.get<Brand[]>("/brands")
  return data
}

export async function createBrand(values: BrandFormValues): Promise<Brand> {
  if (USE_MOCK) {
    return delay({ id: `brand-${Date.now()}`, name: values.name, country: values.country, description: values.description, isActive: values.isActive, productCount: 0 })
  }
  const { data } = await apiClient.post<Brand>("/brands", values)
  return data
}

export async function updateBrand(id: string, values: BrandFormValues): Promise<Brand> {
  if (USE_MOCK) {
    const existing = mockBrands.find((b) => b.id === id)
    if (!existing) throw new Error("Brand not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Brand>(`/brands/${id}`, values)
  return data
}

export async function deleteBrand(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/brands/${id}`)
}

export async function fetchCollections(): Promise<Collection[]> {
  if (USE_MOCK) return delay(mockCollections)
  const { data } = await apiClient.get<Collection[]>("/collections")
  return data
}
