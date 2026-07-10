import { apiClient } from "@/lib/api/client"
import type { InventoryItem, InventoryKpis } from "../types"
import {
  categoryStockDistribution,
  mockInventory,
  movementTrend,
  stockValueByWarehouse,
} from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  if (USE_MOCK) return delay(mockInventory)
  const { data } = await apiClient.get<InventoryItem[]>("/inventory")
  return data
}

export async function fetchInventoryKpis(): Promise<InventoryKpis> {
  if (USE_MOCK) {
    const totalInventoryValue = mockInventory.reduce((sum, i) => sum + i.availableQty * i.unitCost, 0)
    const totalProducts = mockInventory.length
    const lowStockItems = mockInventory.filter((i) => i.availableQty > 0 && i.availableQty <= i.reorderLevel).length
    const outOfStockItems = mockInventory.filter((i) => i.availableQty === 0).length
    return delay({ totalInventoryValue, totalProducts, lowStockItems, outOfStockItems })
  }
  const { data } = await apiClient.get<InventoryKpis>("/inventory/kpis")
  return data
}

export async function fetchStockValueByWarehouse() {
  if (USE_MOCK) return delay(stockValueByWarehouse)
  const { data } = await apiClient.get("/inventory/analytics/stock-value")
  return data
}

export async function fetchCategoryStockDistribution() {
  if (USE_MOCK) return delay(categoryStockDistribution)
  const { data } = await apiClient.get("/inventory/analytics/category-distribution")
  return data
}

export async function fetchMovementTrend() {
  if (USE_MOCK) return delay(movementTrend)
  const { data } = await apiClient.get("/inventory/analytics/movement-trend")
  return data
}
