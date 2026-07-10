import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type {
  ExecutiveInventoryHealth,
  ExecutiveKpis,
  ExpenseBreakdownPoint,
  FinancialOverview,
  MarginAnalysisPoint,
  ProfitTrendPoint,
  SalesPerformancePoint,
  ScheduledReport,
} from "../types"
import {
  executiveKpis,
  expenseBreakdown,
  financialOverview,
  inventoryHealth,
  marginAnalysis,
  mockScheduledReports,
  profitTrend,
  salesPerformance,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Executive Dashboard ---

export async function fetchExecutiveKpis(): Promise<ExecutiveKpis> {
  if (USE_MOCK) return delay(executiveKpis)
  const { data } = await apiClient.get<ExecutiveKpis>("/reports/executive/kpis")
  return data
}

export async function fetchSalesPerformance(): Promise<SalesPerformancePoint[]> {
  if (USE_MOCK) return delay(salesPerformance)
  const { data } = await apiClient.get<SalesPerformancePoint[]>("/reports/executive/sales-performance")
  return data
}

export async function fetchExecutiveInventoryHealth(): Promise<ExecutiveInventoryHealth> {
  if (USE_MOCK) return delay(inventoryHealth)
  const { data } = await apiClient.get<ExecutiveInventoryHealth>("/reports/executive/inventory-health")
  return data
}

// --- Financial Reports ---

export async function fetchFinancialOverview(): Promise<FinancialOverview> {
  if (USE_MOCK) return delay(financialOverview)
  const { data } = await apiClient.get<FinancialOverview>("/reports/finance/overview")
  return data
}

export async function fetchProfitTrend(): Promise<ProfitTrendPoint[]> {
  if (USE_MOCK) return delay(profitTrend)
  const { data } = await apiClient.get<ProfitTrendPoint[]>("/reports/finance/profit-trend")
  return data
}

export async function fetchExpenseBreakdown(): Promise<ExpenseBreakdownPoint[]> {
  if (USE_MOCK) return delay(expenseBreakdown)
  const { data } = await apiClient.get<ExpenseBreakdownPoint[]>("/reports/finance/expense-breakdown")
  return data
}

export async function fetchMarginAnalysis(): Promise<MarginAnalysisPoint[]> {
  if (USE_MOCK) return delay(marginAnalysis)
  const { data } = await apiClient.get<MarginAnalysisPoint[]>("/reports/finance/margin-analysis")
  return data
}

// --- Scheduled Reports ---

export type ScheduledReportFormValues = Omit<ScheduledReport, "id" | "isActive" | "lastSentAt">

export async function fetchScheduledReports(): Promise<ScheduledReport[]> {
  if (USE_MOCK) return delay(mockScheduledReports)
  const { data } = await apiClient.get<ScheduledReport[]>("/reports/scheduled")
  return data
}

export async function createScheduledReport(values: ScheduledReportFormValues): Promise<ScheduledReport> {
  if (USE_MOCK) {
    return delay({
      id: `sched-${Date.now()}`,
      ...values,
      isActive: true,
    })
  }
  const { data } = await apiClient.post<ScheduledReport>("/reports/scheduled", values)
  return data
}

export async function toggleScheduledReport(id: string, isActive: boolean): Promise<ScheduledReport> {
  if (USE_MOCK) {
    const existing = mockScheduledReports.find((r) => r.id === id)
    if (!existing) throw new Error("Scheduled report not found")
    return delay({ ...existing, isActive })
  }
  const { data } = await apiClient.patch<ScheduledReport>(`/reports/scheduled/${id}`, { isActive })
  return data
}

export async function deleteScheduledReport(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/reports/scheduled/${id}`)
}
