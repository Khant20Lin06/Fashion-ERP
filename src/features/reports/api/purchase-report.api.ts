import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type {
  CostChangePoint,
  PurchaseReportMetrics,
  PurchaseTrendPoint,
  SupplierComparisonPoint,
  SupplierPerformanceRow,
} from "../types"
import {
  costChangeAnalysis,
  purchaseReportMetrics,
  purchaseTrend,
  supplierComparison,
  supplierPerformanceRows,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchPurchaseReportMetrics(): Promise<PurchaseReportMetrics> {
  if (USE_MOCK) return delay(purchaseReportMetrics)
  const { data } = await apiClient.get<PurchaseReportMetrics>("/reports/purchase/metrics")
  return data
}

export async function fetchSupplierPerformanceRows(): Promise<SupplierPerformanceRow[]> {
  if (USE_MOCK) return delay(supplierPerformanceRows)
  const { data } = await apiClient.get<SupplierPerformanceRow[]>("/reports/purchase/supplier-performance")
  return data
}

export async function fetchPurchaseTrend(): Promise<PurchaseTrendPoint[]> {
  if (USE_MOCK) return delay(purchaseTrend)
  const { data } = await apiClient.get<PurchaseTrendPoint[]>("/reports/purchase/trend")
  return data
}

export async function fetchSupplierComparison(): Promise<SupplierComparisonPoint[]> {
  if (USE_MOCK) return delay(supplierComparison)
  const { data } = await apiClient.get<SupplierComparisonPoint[]>("/reports/purchase/supplier-comparison")
  return data
}

export async function fetchCostChangeAnalysis(): Promise<CostChangePoint[]> {
  if (USE_MOCK) return delay(costChangeAnalysis)
  const { data } = await apiClient.get<CostChangePoint[]>("/reports/purchase/cost-change")
  return data
}
