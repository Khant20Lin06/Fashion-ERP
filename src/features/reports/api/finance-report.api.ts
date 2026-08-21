import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
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

// None of /reports/executive/*, /reports/finance/* (besides overview, see
// below), or /reports/scheduled exist on the backend. Real report
// controllers are: reports/ar-ap-aging, reports/balance-sheet,
// reports/dashboard, reports/inventory, reports/payments,
// reports/profit-loss, reports/purchases, reports/sales.

// --- Executive Dashboard ---
// No backend endpoint aggregates these executive KPIs — mock-only.

export async function fetchExecutiveKpis(): Promise<ExecutiveKpis> {
  if (USE_MOCK) return delay(executiveKpis)
  return { totalRevenue: 0, revenueChangePercent: 0, grossProfit: 0, grossMarginPercent: 0, totalOrders: 0, customerGrowthPercent: 0 }
}

export async function fetchSalesPerformance(): Promise<SalesPerformancePoint[]> {
  if (USE_MOCK) return delay(salesPerformance)
  return []
}

export async function fetchExecutiveInventoryHealth(): Promise<ExecutiveInventoryHealth> {
  if (USE_MOCK) return delay(inventoryHealth)
  return { totalStockValue: 0, fastMovingCount: 0, slowMovingCount: 0, deadStockCount: 0 }
}

// --- Financial Reports ---
// Real endpoint: @Controller('reports/profit-loss') — a query over posted
// journal entries grouped into revenue/expense totals only (no COGS vs.
// other-expense split), NOT /reports/finance/overview.

type BackendProfitLossResult = {
  fromDate: string | null
  toDate: string | null
  revenue: { rows: unknown[]; total: string }
  expense: { rows: unknown[]; total: string }
  netIncome: string
}

export async function fetchFinancialOverview(): Promise<FinancialOverview> {
  if (USE_MOCK) return delay(financialOverview)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendProfitLossResult>("/reports/profit-loss", {
    params: { companyId },
  })
  const revenue = parseFloat(data.revenue.total) || 0
  const expenses = parseFloat(data.expense.total) || 0
  return {
    revenue,
    // The backend P&L does not separate cost-of-goods-sold from other
    // expenses — not fabricated as a guessed split.
    costOfGoodsSold: 0,
    grossProfit: revenue - expenses,
    expenses,
    netProfit: parseFloat(data.netIncome) || 0,
  }
}

// No backend endpoint returns a profit trend over time, an expense
// category breakdown, or margin-by-period — mock-only until real
// endpoints exist (reports/profit-loss only supports a single date range
// per call, not a time series).

export async function fetchProfitTrend(): Promise<ProfitTrendPoint[]> {
  if (USE_MOCK) return delay(profitTrend)
  return []
}

export async function fetchExpenseBreakdown(): Promise<ExpenseBreakdownPoint[]> {
  if (USE_MOCK) return delay(expenseBreakdown)
  return []
}

export async function fetchMarginAnalysis(): Promise<MarginAnalysisPoint[]> {
  if (USE_MOCK) return delay(marginAnalysis)
  return []
}

// --- Scheduled Reports ---
// No backend scheduled-report endpoint exists — mock-only.

export type ScheduledReportFormValues = Omit<ScheduledReport, "id" | "isActive" | "lastSentAt">

export async function fetchScheduledReports(): Promise<ScheduledReport[]> {
  if (USE_MOCK) return delay(mockScheduledReports)
  return []
}

export async function createScheduledReport(values: ScheduledReportFormValues): Promise<ScheduledReport> {
  if (USE_MOCK) {
    return delay({
      id: `sched-${Date.now()}`,
      ...values,
      isActive: true,
    })
  }
  throw new Error("Scheduled reports are not available yet.")
}

export async function toggleScheduledReport(id: string, isActive: boolean): Promise<ScheduledReport> {
  if (USE_MOCK) {
    const existing = mockScheduledReports.find((r) => r.id === id)
    if (!existing) throw new Error("Scheduled report not found")
    return delay({ ...existing, isActive })
  }
  throw new Error("Scheduled reports are not available yet.")
}

export async function deleteScheduledReport(_id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  throw new Error("Scheduled reports are not available yet.")
}
