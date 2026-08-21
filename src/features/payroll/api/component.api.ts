import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { PayrollCalculationType, PayrollComponent, PayrollComponentType } from "../types"
import { mockPayrollComponents } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real routes: GET/POST/PATCH /payroll/components, POST
// /payroll/components/:id/activate|deactivate, DELETE
// /payroll/components/:id. permission payroll_components.*. Exactly one
// of fixedAmount/percentage must be set, matching calculationType — the
// backend enforces this server-side (not at DTO-validation level), so a
// 400 with a specific message is expected on mismatch. code/type/
// calculationType are immutable after creation.

type BackendPayrollComponent = {
  id: string
  companyId: string
  name: string
  code: string
  type: PayrollComponentType
  calculationType: PayrollCalculationType
  fixedAmount: string | null
  percentage: string | null
  isTaxable: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function mapComponent(b: BackendPayrollComponent): PayrollComponent {
  return { ...b }
}

export async function fetchPayrollComponents(): Promise<PayrollComponent[]> {
  if (USE_MOCK) return delay(mockPayrollComponents)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendPayrollComponent[]; meta: unknown }>("/payroll/components", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapComponent)
}

export type CreatePayrollComponentInput = {
  name: string
  code: string
  type: PayrollComponentType
  calculationType: PayrollCalculationType
  fixedAmount?: string
  percentage?: string
  isTaxable?: boolean
}

export async function createPayrollComponent(values: CreatePayrollComponentInput): Promise<PayrollComponent> {
  if (USE_MOCK) {
    return delay({
      id: `plc-${Date.now()}`,
      companyId: "company-mock",
      name: values.name,
      code: values.code,
      type: values.type,
      calculationType: values.calculationType,
      fixedAmount: values.fixedAmount ?? null,
      percentage: values.percentage ?? null,
      isTaxable: values.isTaxable ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPayrollComponent>("/payroll/components", {
    companyId,
    name: values.name,
    code: values.code,
    type: values.type,
    calculationType: values.calculationType,
    fixedAmount: values.fixedAmount || undefined,
    percentage: values.percentage || undefined,
    isTaxable: values.isTaxable,
  })
  return mapComponent(data)
}

export type UpdatePayrollComponentInput = {
  name?: string
  fixedAmount?: string
  percentage?: string
  isTaxable?: boolean
}

export async function updatePayrollComponent(
  id: string,
  values: UpdatePayrollComponentInput,
): Promise<PayrollComponent> {
  if (USE_MOCK) {
    const existing = mockPayrollComponents.find((c) => c.id === id)
    if (!existing) throw new Error("Payroll component not found")
    return delay({ ...existing, ...values })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendPayrollComponent>(`/payroll/components/${id}`, values, {
    params: { companyId },
  })
  return mapComponent(data)
}

export async function setPayrollComponentActive(id: string, isActive: boolean): Promise<PayrollComponent> {
  if (USE_MOCK) {
    const existing = mockPayrollComponents.find((c) => c.id === id)
    if (!existing) throw new Error("Payroll component not found")
    return delay({ ...existing, isActive })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPayrollComponent>(
    `/payroll/components/${id}/${isActive ? "activate" : "deactivate"}`,
    null,
    { params: { companyId } },
  )
  return mapComponent(data)
}

export async function deletePayrollComponent(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/payroll/components/${id}`, { params: { companyId } })
}
