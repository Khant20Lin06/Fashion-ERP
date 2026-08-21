import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { PayrollPeriod, PayrollPeriodStatus } from "../types"
import { mockPayrollPeriods } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real routes: GET/POST /payroll/periods, POST
// /payroll/periods/:id/cancel. permission payroll_periods.*. Status only
// ever moves OPEN -> PROCESSING -> FINALIZED (as a side effect of
// PayrollRunsService.calculate/finalize, never a direct API call) or
// OPEN/PROCESSING -> CANCELLED via this cancel endpoint. Duplicate exact
// (startDate, endDate) for a company -> 409 Conflict.

type BackendPayrollPeriod = {
  id: string
  companyId: string
  periodNumber: string
  name: string
  startDate: string
  endDate: string
  payDate: string
  status: PayrollPeriodStatus
  createdAt: string
  updatedAt: string
}

function mapPeriod(b: BackendPayrollPeriod): PayrollPeriod {
  return { ...b }
}

export async function fetchPayrollPeriods(): Promise<PayrollPeriod[]> {
  if (USE_MOCK) return delay(mockPayrollPeriods)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendPayrollPeriod[]; meta: unknown }>("/payroll/periods", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapPeriod)
}

export async function fetchPayrollPeriodById(id: string): Promise<PayrollPeriod | undefined> {
  if (USE_MOCK) return delay(mockPayrollPeriods.find((p) => p.id === id))
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendPayrollPeriod>(`/payroll/periods/${id}`, { params: { companyId } })
  return mapPeriod(data)
}

export type CreatePayrollPeriodInput = {
  name: string
  startDate: string
  endDate: string
  payDate: string
}

export async function createPayrollPeriod(values: CreatePayrollPeriodInput): Promise<PayrollPeriod> {
  if (USE_MOCK) {
    return delay({
      id: `plp-${Date.now()}`,
      companyId: "company-mock",
      periodNumber: `PP-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      name: values.name,
      startDate: values.startDate,
      endDate: values.endDate,
      payDate: values.payDate,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPayrollPeriod>("/payroll/periods", {
    companyId,
    name: values.name,
    startDate: values.startDate,
    endDate: values.endDate,
    payDate: values.payDate,
  })
  return mapPeriod(data)
}

export async function cancelPayrollPeriod(id: string): Promise<PayrollPeriod> {
  if (USE_MOCK) {
    const existing = mockPayrollPeriods.find((p) => p.id === id)
    if (!existing) throw new Error("Payroll period not found")
    return delay({ ...existing, status: "CANCELLED" })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPayrollPeriod>(`/payroll/periods/${id}/cancel`, null, {
    params: { companyId },
  })
  return mapPeriod(data)
}
