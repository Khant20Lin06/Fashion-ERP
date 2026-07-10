import { apiClient } from "@/lib/api/client"
import type {
  InventoryAgingBucket,
  InventoryMetrics,
  InventoryReportRow,
  StockDistributionPoint,
  StockMovementPoint,
} from "../types"
import {
  inventoryAging,
  inventoryMetrics,
  inventoryReportRows,
  stockDistributionByBrand,
  stockDistributionByCategory,
  stockDistributionByWarehouse,
  stockMovementTrend,
} from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchInventoryMetrics(): Promise<InventoryMetrics> {
  if (USE_MOCK) return delay(inventoryMetrics)
  const { data } = await apiClient.get<InventoryMetrics>("/reports/inventory/metrics")
  return data
}

export async function fetchStockDistribution(
  dimension: "warehouse" | "category" | "brand"
): Promise<StockDistributionPoint[]> {
  if (USE_MOCK) {
    const byDimension = {
      warehouse: stockDistributionByWarehouse,
      category: stockDistributionByCategory,
      brand: stockDistributionByBrand,
    }
    return delay(byDimension[dimension])
  }
  const { data } = await apiClient.get<StockDistributionPoint[]>("/reports/inventory/distribution", {
    params: { dimension },
  })
  return data
}

export async function fetchStockMovementTrend(): Promise<StockMovementPoint[]> {
  if (USE_MOCK) return delay(stockMovementTrend)
  const { data } = await apiClient.get<StockMovementPoint[]>("/reports/inventory/movement-trend")
  return data
}

export async function fetchInventoryAging(): Promise<InventoryAgingBucket[]> {
  if (USE_MOCK) return delay(inventoryAging)
  const { data } = await apiClient.get<InventoryAgingBucket[]>("/reports/inventory/aging")
  return data
}

export async function fetchInventoryReportRows(): Promise<InventoryReportRow[]> {
  if (USE_MOCK) return delay(inventoryReportRows)
  const { data } = await apiClient.get<InventoryReportRow[]>("/reports/inventory/detail")
  return data
}
