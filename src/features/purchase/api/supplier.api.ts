import { apiClient } from "@/lib/api/client"
import type { Supplier, SupplierPerformance } from "../types"
import type { SupplierFormValues } from "../schemas/supplier.schema"
import { mockSupplierPerformance, mockSuppliers } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  if (USE_MOCK) return delay(mockSuppliers)
  const { data } = await apiClient.get<Supplier[]>("/suppliers")
  return data
}

export async function fetchSupplierById(id: string): Promise<Supplier | undefined> {
  if (USE_MOCK) return delay(mockSuppliers.find((s) => s.id === id))
  const { data } = await apiClient.get<Supplier>(`/suppliers/${id}`)
  return data
}

export async function fetchSupplierPerformance(id: string): Promise<SupplierPerformance | undefined> {
  if (USE_MOCK) return delay(mockSupplierPerformance[id])
  const { data } = await apiClient.get<SupplierPerformance>(`/suppliers/${id}/performance`)
  return data
}

export async function createSupplier(values: SupplierFormValues): Promise<Supplier> {
  if (USE_MOCK) {
    return delay({ id: `sup-${Date.now()}`, ...values, totalPurchase: 0, outstanding: 0 })
  }
  const { data } = await apiClient.post<Supplier>("/suppliers", values)
  return data
}

export async function updateSupplier(id: string, values: SupplierFormValues): Promise<Supplier> {
  if (USE_MOCK) {
    const existing = mockSuppliers.find((s) => s.id === id)
    if (!existing) throw new Error("Supplier not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Supplier>(`/suppliers/${id}`, values)
  return data
}

export async function deleteSupplier(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/suppliers/${id}`)
}
