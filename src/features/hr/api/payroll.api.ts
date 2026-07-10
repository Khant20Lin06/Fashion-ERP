import { apiClient } from "@/lib/api/client"
import type {
  AbsenceTrendPoint,
  DepartmentCostPoint,
  HeadcountGrowthPoint,
  LateTrendPoint,
  PayrollDashboardMetrics,
  PayrollEntry,
  PayrollStatus,
  PerformanceReview,
  SalaryCostPoint,
  TurnoverPoint,
} from "../types"
import type { PayrollEntryFormValues } from "../schemas/payroll.schema"
import { calculateNetSalary } from "../schemas/payroll.schema"
import type { PerformanceReviewFormValues } from "../schemas/performance.schema"
import {
  absenceTrend,
  departmentCost,
  headcountGrowth,
  lateTrend,
  mockPayrollEntries,
  mockPerformanceReviews,
  payrollDashboardMetrics,
  salaryCostTrend,
  turnoverTrend,
} from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Payroll ---

export async function fetchPayrollEntries(): Promise<PayrollEntry[]> {
  if (USE_MOCK) return delay(mockPayrollEntries)
  const { data } = await apiClient.get<PayrollEntry[]>("/hr/payroll")
  return data
}

export async function fetchPayrollDashboardMetrics(): Promise<PayrollDashboardMetrics> {
  if (USE_MOCK) return delay(payrollDashboardMetrics)
  const { data } = await apiClient.get<PayrollDashboardMetrics>("/hr/payroll/metrics")
  return data
}

export async function createPayrollEntry(values: PayrollEntryFormValues): Promise<PayrollEntry> {
  if (USE_MOCK) {
    const { mockEmployees } = await import("./mock-data")
    const employee = mockEmployees.find((e) => e.id === values.employeeId)
    return delay({
      id: `pr-${Date.now()}`,
      employeeId: values.employeeId,
      employeeName: employee?.name ?? "",
      period: values.period,
      basicSalary: values.basicSalary,
      allowance: values.allowance,
      bonus: values.bonus,
      deduction: values.deduction,
      tax: values.tax,
      netSalary: calculateNetSalary(values),
      status: "draft",
    })
  }
  const { data } = await apiClient.post<PayrollEntry>("/hr/payroll", values)
  return data
}

export async function updatePayrollStatus(id: string, status: PayrollStatus): Promise<PayrollEntry> {
  if (USE_MOCK) {
    const existing = mockPayrollEntries.find((p) => p.id === id)
    if (!existing) throw new Error("Payroll entry not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<PayrollEntry>(`/hr/payroll/${id}/status`, { status })
  return data
}

// --- Performance ---

export async function fetchPerformanceReviews(): Promise<PerformanceReview[]> {
  if (USE_MOCK) return delay(mockPerformanceReviews)
  const { data } = await apiClient.get<PerformanceReview[]>("/hr/performance")
  return data
}

export async function createPerformanceReview(values: PerformanceReviewFormValues): Promise<PerformanceReview> {
  if (USE_MOCK) {
    const { mockEmployees } = await import("./mock-data")
    const employee = mockEmployees.find((e) => e.id === values.employeeId)
    return delay({
      id: `perf-${Date.now()}`,
      employeeId: values.employeeId,
      employeeName: employee?.name ?? "",
      period: values.period,
      goals: values.goals.map((goal, index) => ({ id: `g-${Date.now()}-${index}`, ...goal })),
      score: values.score,
      managerFeedback: values.managerFeedback,
      comments: values.comments,
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<PerformanceReview>("/hr/performance", values)
  return data
}

// --- HR Analytics ---

export async function fetchHeadcountGrowth(): Promise<HeadcountGrowthPoint[]> {
  if (USE_MOCK) return delay(headcountGrowth)
  const { data } = await apiClient.get<HeadcountGrowthPoint[]>("/hr/analytics/headcount-growth")
  return data
}

export async function fetchTurnoverTrend(): Promise<TurnoverPoint[]> {
  if (USE_MOCK) return delay(turnoverTrend)
  const { data } = await apiClient.get<TurnoverPoint[]>("/hr/analytics/turnover")
  return data
}

export async function fetchLateTrend(): Promise<LateTrendPoint[]> {
  if (USE_MOCK) return delay(lateTrend)
  const { data } = await apiClient.get<LateTrendPoint[]>("/hr/analytics/late-trend")
  return data
}

export async function fetchAbsenceTrend(): Promise<AbsenceTrendPoint[]> {
  if (USE_MOCK) return delay(absenceTrend)
  const { data } = await apiClient.get<AbsenceTrendPoint[]>("/hr/analytics/absence-trend")
  return data
}

export async function fetchSalaryCostTrend(): Promise<SalaryCostPoint[]> {
  if (USE_MOCK) return delay(salaryCostTrend)
  const { data } = await apiClient.get<SalaryCostPoint[]>("/hr/analytics/salary-cost")
  return data
}

export async function fetchDepartmentCost(): Promise<DepartmentCostPoint[]> {
  if (USE_MOCK) return delay(departmentCost)
  const { data } = await apiClient.get<DepartmentCostPoint[]>("/hr/analytics/department-cost")
  return data
}
