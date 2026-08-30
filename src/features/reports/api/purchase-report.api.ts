import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
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

type BackendPurchaseSummary = {
  purchaseOrderCount: number | string
  grandTotal: number | string
  subtotal: number | string
  discountAmount: number | string
  taxAmount: number | string
}

type BackendPurchaseByDateRow = {
  date: string
  purchaseOrderCount: number | string
  grandTotal: number | string
}

type BackendPurchaseBySupplierRow = {
  supplierId: string
  supplierCode: string
  supplierName: string
  purchaseOrderCount: number | string
  grandTotal: number | string
}

type BackendPaginatedResponse<T> = {
  data?: T[]
  meta?: {
    page?: number
    limit?: number
    total?: number
  } | null
}

function formatPeriodLabel(dateInput: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateInput))
}

async function fetchDraftPurchaseOrderCount(companyId: string): Promise<number> {
  try {
    const { data } = await apiClient.get<BackendPaginatedResponse<unknown>>("/purchase-orders", {
      params: { companyId, status: "DRAFT", page: 1, limit: 1 },
    })
    return typeof data.meta?.total === "number" ? data.meta.total : 0
  } catch {
    return 0
  }
}

async function fetchPurchaseSummary(companyId: string): Promise<BackendPurchaseSummary> {
  const { data } = await apiClient.get<BackendPurchaseSummary>("/reports/purchases/summary", {
    params: { companyId },
  })
  return data
}

async function fetchPurchaseByDate(companyId: string): Promise<BackendPurchaseByDateRow[]> {
  const { data } = await apiClient.get<BackendPurchaseByDateRow[]>("/reports/purchases/by-date", {
    params: { companyId },
  })
  return data
}

async function fetchPurchaseBySupplier(companyId: string): Promise<BackendPurchaseBySupplierRow[]> {
  const { data } = await apiClient.get<BackendPurchaseBySupplierRow[]>("/reports/purchases/by-supplier", {
    params: { companyId },
  })
  return data
}

export async function fetchPurchaseReportMetrics(): Promise<PurchaseReportMetrics> {
  if (USE_MOCK) return delay(purchaseReportMetrics)
  const companyId = await resolveCompanyId()
  const [summary, supplierRows, pendingOrders] = await Promise.all([
    fetchPurchaseSummary(companyId),
    fetchPurchaseBySupplier(companyId),
    fetchDraftPurchaseOrderCount(companyId),
  ])

  const totalPurchase = parseFloat(String(summary.grandTotal)) || 0
  const purchaseOrderCount = Number(summary.purchaseOrderCount) || 0

  return {
    totalPurchase,
    supplierCount: supplierRows.length,
    pendingOrders,
    averageCost: purchaseOrderCount > 0 ? totalPurchase / purchaseOrderCount : 0,
  }
}

export async function fetchSupplierPerformanceRows(): Promise<SupplierPerformanceRow[]> {
  if (USE_MOCK) return delay(supplierPerformanceRows)
  const companyId = await resolveCompanyId()
  const rows = await fetchPurchaseBySupplier(companyId)
  return rows.map((row) => ({
    supplierId: row.supplierId,
    supplierCode: row.supplierCode,
    supplierName: row.supplierName,
    purchaseOrderCount: Number(row.purchaseOrderCount) || 0,
    purchaseAmount: parseFloat(String(row.grandTotal)) || 0,
    deliveryRatePercent: null,
    qualityScore: null,
    paymentStatus: null,
  }))
}

export async function fetchPurchaseTrend(): Promise<PurchaseTrendPoint[]> {
  if (USE_MOCK) return delay(purchaseTrend)
  const companyId = await resolveCompanyId()
  const rows = await fetchPurchaseByDate(companyId)
  return rows.map((row) => ({
    period: formatPeriodLabel(row.date),
    amount: parseFloat(String(row.grandTotal)) || 0,
  }))
}

export async function fetchSupplierComparison(): Promise<SupplierComparisonPoint[]> {
  if (USE_MOCK) return delay(supplierComparison)
  const companyId = await resolveCompanyId()
  const rows = await fetchPurchaseBySupplier(companyId)
  return rows.map((row) => ({
    supplierName: row.supplierName,
    amount: parseFloat(String(row.grandTotal)) || 0,
  }))
}

export async function fetchCostChangeAnalysis(): Promise<CostChangePoint[]> {
  if (USE_MOCK) return delay(costChangeAnalysis)
  return []
}
