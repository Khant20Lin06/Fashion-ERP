import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { Branch, Warehouse } from "../types"
import { mockBranches, mockWarehouses } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export type WarehouseFormValues = {
  name: string
  code: string
  branchId: string
  address: string
  manager: string
  contact: string
  status: "active" | "inactive"
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  if (USE_MOCK) return delay(mockWarehouses)
  const { data } = await apiClient.get<Warehouse[]>("/warehouses")
  return data
}

export async function fetchBranches(): Promise<Branch[]> {
  if (USE_MOCK) return delay(mockBranches)
  const { data } = await apiClient.get<Branch[]>("/branches")
  return data
}

export async function createWarehouse(values: WarehouseFormValues): Promise<Warehouse> {
  if (USE_MOCK) {
    const branch = mockBranches.find((b) => b.id === values.branchId)
    return delay({
      id: `wh-${Date.now()}`,
      ...values,
      branchName: branch?.name ?? "",
      totalProducts: 0,
      stockValue: 0,
    })
  }
  const { data } = await apiClient.post<Warehouse>("/warehouses", values)
  return data
}

export async function updateWarehouse(id: string, values: WarehouseFormValues): Promise<Warehouse> {
  if (USE_MOCK) {
    const existing = mockWarehouses.find((w) => w.id === id)
    if (!existing) throw new Error("Warehouse not found")
    const branch = mockBranches.find((b) => b.id === values.branchId)
    return delay({ ...existing, ...values, branchName: branch?.name ?? existing.branchName })
  }
  const { data } = await apiClient.put<Warehouse>(`/warehouses/${id}`, values)
  return data
}

export async function deleteWarehouse(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/warehouses/${id}`)
}
