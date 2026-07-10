import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { StockAdjustment, StockCountSession, StockMovement } from "../types"
import type { AdjustmentFormValues } from "../schemas/adjustment.schema"
import { mockAdjustments, mockMovements, mockStockCounts } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchStockMovements(): Promise<StockMovement[]> {
  if (USE_MOCK) return delay(mockMovements)
  const { data } = await apiClient.get<StockMovement[]>("/inventory/movements")
  return data
}

export async function fetchStockAdjustments(): Promise<StockAdjustment[]> {
  if (USE_MOCK) return delay(mockAdjustments)
  const { data } = await apiClient.get<StockAdjustment[]>("/inventory/adjustments")
  return data
}

export async function createStockAdjustment(values: AdjustmentFormValues): Promise<StockAdjustment> {
  if (USE_MOCK) {
    return delay({
      id: `adj-${Date.now()}`,
      reference: `ADJ-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      warehouseId: values.warehouseId,
      warehouseName: "",
      productId: values.productId,
      productName: "",
      sku: "",
      currentQty: values.currentQty,
      adjustedQty: values.adjustedQty,
      difference: values.adjustedQty - values.currentQty,
      type: values.type,
      reason: values.reason,
      notes: values.notes,
      status: "pending",
      createdBy: "You",
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<StockAdjustment>("/inventory/adjustments", values)
  return data
}

export async function fetchStockCounts(): Promise<StockCountSession[]> {
  if (USE_MOCK) return delay(mockStockCounts)
  const { data } = await apiClient.get<StockCountSession[]>("/inventory/stock-counts")
  return data
}

export async function submitStockCount(sessionId: string, lines: StockCountSession["lines"]): Promise<StockCountSession> {
  if (USE_MOCK) {
    const session = mockStockCounts.find((s) => s.id === sessionId)
    if (!session) throw new Error("Stock count session not found")
    return delay({ ...session, lines, status: "completed" })
  }
  const { data } = await apiClient.put<StockCountSession>(`/inventory/stock-counts/${sessionId}`, { lines })
  return data
}

export async function lookupBySku(sku: string) {
  if (USE_MOCK) {
    const { mockInventory } = await import("./mock-data")
    return delay(mockInventory.find((i) => i.sku.toLowerCase() === sku.toLowerCase()))
  }
  const { data } = await apiClient.get("/inventory/lookup", { params: { sku } })
  return data
}
