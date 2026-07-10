import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type {
  ColorAnalysisPoint,
  CustomerGrowthPoint,
  CustomerInsightMetrics,
  CustomerSegmentPoint,
  ProductPerformanceMetrics,
  ProductRankingRow,
  PurchaseFrequencyPoint,
  SizeAnalysisPoint,
  SpendingDistributionPoint,
} from "../types"
import {
  colorAnalysis,
  customerGrowth,
  customerInsightMetrics,
  customerSegments,
  productPerformanceMetrics,
  productRankings,
  purchaseFrequency,
  sizeAnalysis,
  spendingDistribution,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Customer Analytics ---

export async function fetchCustomerInsightMetrics(): Promise<CustomerInsightMetrics> {
  if (USE_MOCK) return delay(customerInsightMetrics)
  const { data } = await apiClient.get<CustomerInsightMetrics>("/reports/customer/metrics")
  return data
}

export async function fetchCustomerSegments(): Promise<CustomerSegmentPoint[]> {
  if (USE_MOCK) return delay(customerSegments)
  const { data } = await apiClient.get<CustomerSegmentPoint[]>("/reports/customer/segments")
  return data
}

export async function fetchCustomerGrowth(): Promise<CustomerGrowthPoint[]> {
  if (USE_MOCK) return delay(customerGrowth)
  const { data } = await apiClient.get<CustomerGrowthPoint[]>("/reports/customer/growth")
  return data
}

export async function fetchPurchaseFrequency(): Promise<PurchaseFrequencyPoint[]> {
  if (USE_MOCK) return delay(purchaseFrequency)
  const { data } = await apiClient.get<PurchaseFrequencyPoint[]>("/reports/customer/purchase-frequency")
  return data
}

export async function fetchSpendingDistribution(): Promise<SpendingDistributionPoint[]> {
  if (USE_MOCK) return delay(spendingDistribution)
  const { data } = await apiClient.get<SpendingDistributionPoint[]>("/reports/customer/spending-distribution")
  return data
}

// --- Product Analytics ---

export async function fetchProductPerformanceMetrics(): Promise<ProductPerformanceMetrics> {
  if (USE_MOCK) return delay(productPerformanceMetrics)
  const { data } = await apiClient.get<ProductPerformanceMetrics>("/reports/products/metrics")
  return data
}

export async function fetchProductRankings(): Promise<ProductRankingRow[]> {
  if (USE_MOCK) return delay(productRankings)
  const { data } = await apiClient.get<ProductRankingRow[]>("/reports/products/rankings")
  return data
}

export async function fetchSizeAnalysis(): Promise<SizeAnalysisPoint[]> {
  if (USE_MOCK) return delay(sizeAnalysis)
  const { data } = await apiClient.get<SizeAnalysisPoint[]>("/reports/products/size-analysis")
  return data
}

export async function fetchColorAnalysis(): Promise<ColorAnalysisPoint[]> {
  if (USE_MOCK) return delay(colorAnalysis)
  const { data } = await apiClient.get<ColorAnalysisPoint[]>("/reports/products/color-analysis")
  return data
}
