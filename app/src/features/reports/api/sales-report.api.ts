import { apiClient } from "@/lib/api/client"
import type {
  CategorySalesPoint,
  Granularity,
  PaymentMethodSalesPoint,
  RevenueTrendPoint,
  SalesDetailRow,
  SalesMetrics,
} from "../types"
import { categorySales, paymentMethodSales, revenueTrendByGranularity, salesDetailRows, salesMetrics } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchSalesMetrics(): Promise<SalesMetrics> {
  if (USE_MOCK) return delay(salesMetrics)
  const { data } = await apiClient.get<SalesMetrics>("/reports/sales/metrics")
  return data
}

export async function fetchSalesRevenueTrend(granularity: Granularity): Promise<RevenueTrendPoint[]> {
  if (USE_MOCK) return delay(revenueTrendByGranularity[granularity])
  const { data } = await apiClient.get<RevenueTrendPoint[]>("/reports/sales/revenue-trend", { params: { granularity } })
  return data
}

export async function fetchCategorySales(): Promise<CategorySalesPoint[]> {
  if (USE_MOCK) return delay(categorySales)
  const { data } = await apiClient.get<CategorySalesPoint[]>("/reports/sales/by-category")
  return data
}

export async function fetchPaymentMethodSales(): Promise<PaymentMethodSalesPoint[]> {
  if (USE_MOCK) return delay(paymentMethodSales)
  const { data } = await apiClient.get<PaymentMethodSalesPoint[]>("/reports/sales/by-payment-method")
  return data
}

export async function fetchSalesDetailRows(): Promise<SalesDetailRow[]> {
  if (USE_MOCK) return delay(salesDetailRows)
  const { data } = await apiClient.get<SalesDetailRow[]>("/reports/sales/detail")
  return data
}
