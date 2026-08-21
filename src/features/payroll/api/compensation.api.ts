import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { EmployeeCompensation, PayFrequency } from "../types"
import { mockCompensationByEmployee } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real routes: GET/POST /employees/:employeeId/compensation. permission
// employee_compensations.read/create. Append-only — no update/delete
// endpoint exists (a salary change must never overwrite the value a
// finalized PayrollRun calculated against, per the backend entity's own
// docblock). A new row with a later effectiveFrom supersedes the old one
// going forward; overlapping date ranges are rejected with 409 Conflict.

type BackendEmployeeCompensation = {
  id: string
  companyId: string
  employeeId: string
  effectiveFrom: string
  effectiveTo: string | null
  baseSalary: string
  currency: string
  payFrequency: PayFrequency
  createdAt: string
  updatedAt: string
}

function mapCompensation(b: BackendEmployeeCompensation): EmployeeCompensation {
  return { ...b }
}

export async function fetchEmployeeCompensation(employeeId: string): Promise<EmployeeCompensation[]> {
  if (USE_MOCK) return delay(mockCompensationByEmployee[employeeId] ?? [])
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendEmployeeCompensation[]; meta: unknown }>(
    `/employees/${employeeId}/compensation`,
    { params: { companyId, limit: 100 } },
  )
  return (data.data ?? []).map(mapCompensation)
}

export type CreateEmployeeCompensationInput = {
  effectiveFrom: string
  effectiveTo?: string
  baseSalary: string
  currency: string
  payFrequency?: PayFrequency
}

export async function createEmployeeCompensation(
  employeeId: string,
  values: CreateEmployeeCompensationInput,
): Promise<EmployeeCompensation> {
  if (USE_MOCK) {
    return delay({
      id: `comp-${Date.now()}`,
      companyId: "company-mock",
      employeeId,
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.effectiveTo ?? null,
      baseSalary: values.baseSalary,
      currency: values.currency,
      payFrequency: values.payFrequency ?? "MONTHLY",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<BackendEmployeeCompensation>(
    `/employees/${employeeId}/compensation`,
    {
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.effectiveTo || undefined,
      baseSalary: values.baseSalary,
      currency: values.currency,
      payFrequency: values.payFrequency,
    },
  )
  return mapCompensation(data)
}
