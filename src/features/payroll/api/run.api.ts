import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type {
  PayrollCalculationType,
  PayrollComponentType,
  PayrollRun,
  PayrollRunEmployee,
  PayrollRunEmployeeItem,
  PayrollRunEmployeeStatus,
  PayrollRunStatus,
} from "../types"
import { mockPayrollRunEmployees, mockPayrollRuns } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real routes: GET/POST /payroll/runs, GET /payroll/runs/:id/employees
// [/:employeeId], POST /payroll/runs/:id/{calculate,finalize,cancel}.
// permission payroll_runs.*. State machine: DRAFT ->(calculate)->
// PROCESSING -> CALCULATED ->(finalize)-> FINALIZED (terminal). cancel
// only from DRAFT or CALCULATED. Every guard violation is 422
// UnprocessableEntity ("Cannot <action> a payroll run in status
// {status}"); creating a second active run for the same period is 409
// Conflict. The run always includes ALL active employees with resolvable
// compensation as of the period start date — there is no
// employee-selection field on create. The list endpoint
// (GET .../employees) does NOT include the per-component item
// breakdown — only the single-employee detail endpoint does.

type BackendPayrollRun = {
  id: string
  companyId: string
  payrollPeriodId: string
  runNumber: string
  status: PayrollRunStatus
  employeeCount: number
  totalGrossPay: string
  totalDeductions: string
  totalNetPay: string
  startedAt: string | null
  completedAt: string | null
  finalizedAt: string | null
  createdBy: string
  finalizedBy: string | null
  createdAt: string
  updatedAt: string
}

type BackendPayrollRunEmployeeItem = {
  id: string
  payrollComponentId: string | null
  componentNameSnapshot: string
  componentCodeSnapshot: string
  type: PayrollComponentType
  calculationTypeSnapshot: PayrollCalculationType
  amount: string
}

type BackendPayrollRunEmployee = {
  id: string
  payrollRunId: string
  employeeId: string
  employeeCodeSnapshot: string
  employeeNameSnapshot: string
  departmentSnapshot: string | null
  designationSnapshot: string | null
  baseSalarySnapshot: string
  grossPay: string
  totalDeductions: string
  netPay: string
  status: PayrollRunEmployeeStatus
  items?: BackendPayrollRunEmployeeItem[]
}

function mapRun(b: BackendPayrollRun): PayrollRun {
  return { ...b }
}

function mapRunEmployee(b: BackendPayrollRunEmployee): PayrollRunEmployee {
  return {
    ...b,
    items: b.items?.map((item): PayrollRunEmployeeItem => ({ ...item })),
  }
}

export async function fetchPayrollRuns(): Promise<PayrollRun[]> {
  if (USE_MOCK) return delay(mockPayrollRuns)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendPayrollRun[]; meta: unknown }>("/payroll/runs", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapRun)
}

export async function fetchPayrollRunById(id: string): Promise<PayrollRun | undefined> {
  if (USE_MOCK) return delay(mockPayrollRuns.find((r) => r.id === id))
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendPayrollRun>(`/payroll/runs/${id}`, { params: { companyId } })
  return mapRun(data)
}

export async function createPayrollRun(payrollPeriodId: string): Promise<PayrollRun> {
  if (USE_MOCK) {
    return delay({
      id: `plr-${Date.now()}`,
      companyId: "company-mock",
      payrollPeriodId,
      runNumber: `PR-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      status: "DRAFT",
      employeeCount: 0,
      totalGrossPay: "0.00",
      totalDeductions: "0.00",
      totalNetPay: "0.00",
      startedAt: null,
      completedAt: null,
      finalizedAt: null,
      createdBy: "current-user",
      finalizedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPayrollRun>("/payroll/runs", { companyId, payrollPeriodId })
  return mapRun(data)
}

export async function calculatePayrollRun(id: string): Promise<PayrollRun> {
  if (USE_MOCK) {
    const existing = mockPayrollRuns.find((r) => r.id === id)
    if (!existing) throw new Error("Payroll run not found")
    return delay({ ...existing, status: "CALCULATED", completedAt: new Date().toISOString() })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPayrollRun>(`/payroll/runs/${id}/calculate`, null, {
    params: { companyId },
  })
  return mapRun(data)
}

export async function finalizePayrollRun(id: string): Promise<PayrollRun> {
  if (USE_MOCK) {
    const existing = mockPayrollRuns.find((r) => r.id === id)
    if (!existing) throw new Error("Payroll run not found")
    return delay({ ...existing, status: "FINALIZED", finalizedAt: new Date().toISOString() })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPayrollRun>(`/payroll/runs/${id}/finalize`, null, {
    params: { companyId },
  })
  return mapRun(data)
}

export async function cancelPayrollRun(id: string): Promise<PayrollRun> {
  if (USE_MOCK) {
    const existing = mockPayrollRuns.find((r) => r.id === id)
    if (!existing) throw new Error("Payroll run not found")
    return delay({ ...existing, status: "CANCELLED" })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPayrollRun>(`/payroll/runs/${id}/cancel`, null, {
    params: { companyId },
  })
  return mapRun(data)
}

export async function fetchPayrollRunEmployees(runId: string): Promise<PayrollRunEmployee[]> {
  if (USE_MOCK) return delay(mockPayrollRunEmployees.filter((e) => e.payrollRunId === runId))
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendPayrollRunEmployee[]; meta: unknown }>(
    `/payroll/runs/${runId}/employees`,
    { params: { companyId, limit: 100 } },
  )
  return (data.data ?? []).map(mapRunEmployee)
}

export async function fetchPayrollRunEmployeeDetail(
  runId: string,
  employeeId: string,
): Promise<PayrollRunEmployee | undefined> {
  if (USE_MOCK) {
    return delay(mockPayrollRunEmployees.find((e) => e.payrollRunId === runId && e.employeeId === employeeId))
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendPayrollRunEmployee>(
    `/payroll/runs/${runId}/employees/${employeeId}`,
    { params: { companyId } },
  )
  return mapRunEmployee(data)
}
