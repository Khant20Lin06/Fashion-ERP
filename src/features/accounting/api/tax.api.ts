import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { TaxRule, TaxType } from "../types"
import { mockTaxRules } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export type TaxRuleFormValues = {
  name: string
  ratePercent: number
  type: TaxType
  accountId: string
  isActive: boolean
}

export async function fetchTaxRules(): Promise<TaxRule[]> {
  if (USE_MOCK) return delay(mockTaxRules)
  const { data } = await apiClient.get<TaxRule[]>("/accounting/tax")
  return data
}

export async function createTaxRule(values: TaxRuleFormValues): Promise<TaxRule> {
  if (USE_MOCK) {
    const { mockAccounts } = await import("./mock-data")
    const account = mockAccounts.find((a) => a.id === values.accountId)
    return delay({
      id: `tax-${Date.now()}`,
      name: values.name,
      ratePercent: values.ratePercent,
      type: values.type,
      accountId: values.accountId,
      accountName: account?.name ?? "",
      isActive: values.isActive,
    })
  }
  const { data } = await apiClient.post<TaxRule>("/accounting/tax", values)
  return data
}

export async function toggleTaxRule(id: string, isActive: boolean): Promise<TaxRule> {
  if (USE_MOCK) {
    const existing = mockTaxRules.find((t) => t.id === id)
    if (!existing) throw new Error("Tax rule not found")
    return delay({ ...existing, isActive })
  }
  const { data } = await apiClient.patch<TaxRule>(`/accounting/tax/${id}`, { isActive })
  return data
}
