import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { PayrollConfiguration, UnpaidLeaveCalculation } from "../types"
import { mockPayrollConfiguration } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real routes: GET/PUT /payroll/configuration — a singleton per company
// (PUT upserts; there is no separate POST). permission
// payroll_configuration.*. There is deliberately no tax-rate, pay-
// frequency, or rounding-rule field on this entity — it is not a generic
// settings bag (per the backend entity's own docblock), only
// defaultCurrency + how unpaid leave is deducted.

type BackendPayrollConfiguration = {
  id: string
  companyId: string
  defaultCurrency: string
  unpaidLeaveCalculation: UnpaidLeaveCalculation
  workingDaysPerMonth: number | null
  createdAt: string
  updatedAt: string
}

function mapConfiguration(b: BackendPayrollConfiguration): PayrollConfiguration {
  return { ...b }
}

/** Returns undefined (not throw) when no configuration has been set up
 * yet — the real backend 404s in that case; callers should show a
 * "set up payroll configuration" empty state rather than an error. */
export async function fetchPayrollConfiguration(): Promise<PayrollConfiguration | undefined> {
  if (USE_MOCK) return delay(mockPayrollConfiguration)
  const companyId = await resolveCompanyId()
  try {
    const { data } = await apiClient.get<BackendPayrollConfiguration>("/payroll/configuration", {
      params: { companyId },
    })
    return mapConfiguration(data)
  } catch (error) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) return undefined
    throw error
  }
}

export type UpsertPayrollConfigurationInput = {
  defaultCurrency: string
  unpaidLeaveCalculation: UnpaidLeaveCalculation
  workingDaysPerMonth?: number
}

export async function upsertPayrollConfiguration(
  values: UpsertPayrollConfigurationInput,
): Promise<PayrollConfiguration> {
  if (USE_MOCK) {
    return delay({
      id: mockPayrollConfiguration?.id ?? `plcfg-${Date.now()}`,
      companyId: "company-mock",
      defaultCurrency: values.defaultCurrency,
      unpaidLeaveCalculation: values.unpaidLeaveCalculation,
      workingDaysPerMonth: values.unpaidLeaveCalculation === "DAILY_RATE" ? (values.workingDaysPerMonth ?? null) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.put<BackendPayrollConfiguration>(
    "/payroll/configuration",
    {
      defaultCurrency: values.defaultCurrency,
      unpaidLeaveCalculation: values.unpaidLeaveCalculation,
      workingDaysPerMonth: values.unpaidLeaveCalculation === "DAILY_RATE" ? values.workingDaysPerMonth : undefined,
    },
    { params: { companyId } },
  )
  return mapConfiguration(data)
}
