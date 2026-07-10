import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { AttributeKind, AttributeOption } from "../types"
import type { AttributeOptionFormValues } from "../schemas/product.schema"
import { attributeOptions } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchAttributeOptions(kind: AttributeKind): Promise<AttributeOption[]> {
  if (USE_MOCK) return delay(attributeOptions.filter((option) => option.kind === kind))
  const { data } = await apiClient.get<AttributeOption[]>("/product-attributes", { params: { kind } })
  return data
}

export async function createAttributeOption(kind: AttributeKind, values: AttributeOptionFormValues): Promise<AttributeOption> {
  if (USE_MOCK) {
    return delay({ id: `${kind}-${Date.now()}`, kind, value: values.value, swatch: values.swatch })
  }
  const { data } = await apiClient.post<AttributeOption>("/product-attributes", { kind, ...values })
  return data
}

export async function updateAttributeOption(id: string, values: AttributeOptionFormValues): Promise<AttributeOption> {
  if (USE_MOCK) {
    const existing = attributeOptions.find((option) => option.id === id)
    if (!existing) throw new Error("Attribute option not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<AttributeOption>(`/product-attributes/${id}`, values)
  return data
}

export async function deleteAttributeOption(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/product-attributes/${id}`)
}
