import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { Category } from "../types"
import type { CategoryFormValues } from "../schemas/product.schema"
import { mockCategories } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) return delay(mockCategories)
  const { data } = await apiClient.get<Category[]>("/categories")
  return data
}

export async function createCategory(values: CategoryFormValues): Promise<Category> {
  if (USE_MOCK) {
    return delay({ id: `cat-${Date.now()}`, name: values.name, parentId: values.parentId, isActive: values.isActive, productCount: 0 })
  }
  const { data } = await apiClient.post<Category>("/categories", values)
  return data
}

export async function updateCategory(id: string, values: CategoryFormValues): Promise<Category> {
  if (USE_MOCK) {
    const existing = mockCategories.find((c) => c.id === id)
    if (!existing) throw new Error("Category not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Category>(`/categories/${id}`, values)
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/categories/${id}`)
}
