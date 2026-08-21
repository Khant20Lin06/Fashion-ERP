import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type {
  CategorySalesPoint,
  Granularity,
  PaymentMethodSalesPoint,
  RevenueTrendPoint,
  SalesDetailRow,
  SalesMetrics,
} from "../types"
import { categorySales, paymentMethodSales, revenueTrendByGranularity, salesDetailRows, salesMetrics } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

type BackendSalesByDateRow = {
  date?: string
  period?: string
  grandTotal?: string | number
  revenue?: string | number
}

export async function fetchSalesMetrics(): Promise<SalesMetrics> {
  if (USE_MOCK) return delay(salesMetrics)
  const { data } = await apiClient.get<SalesMetrics>("/reports/sales/metrics")
  return data
}

export async function fetchSalesRevenueTrend(granularity: Granularity): Promise<RevenueTrendPoint[]> {
  if (USE_MOCK) return delay(revenueTrendByGranularity[granularity])
  const { data } = await apiClient.get<BackendSalesByDateRow[]>("/reports/sales/by-date", { params: { granularity } })
  return data.map((item) => {
    const dateVal = item.date || item.period || ""
    let formattedPeriod = dateVal
    const d = new Date(dateVal)
    if (!isNaN(d.getTime())) {
      formattedPeriod =
        granularity === "monthly"
          ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
    return {
      period: formattedPeriod,
      revenue: Number(item.revenue || item.grandTotal || 0),
    }
  })
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
