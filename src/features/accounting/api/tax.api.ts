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

// No tax entity, controller, or DTO exists anywhere in the backend beyond
// the pass-through `taxAmount` line field on Sale/PurchaseOrder items (no
// rate engine behind it) — confirmed by a whole-repo grep for tax
// controllers/routes. Genuine BACKEND GAP, not a frontend bug: there is no
// `/accounting/tax` (or any) route to call. Mock-only until such a concept
// is added server-side.

export async function fetchTaxRules(): Promise<TaxRule[]> {
  if (USE_MOCK) return delay(mockTaxRules)
  return []
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
  throw new Error("Tax rules are not available yet.")
}

export async function toggleTaxRule(id: string, isActive: boolean): Promise<TaxRule> {
  if (USE_MOCK) {
    const existing = mockTaxRules.find((t) => t.id === id)
    if (!existing) throw new Error("Tax rule not found")
    return delay({ ...existing, isActive })
  }
  throw new Error("Tax rules are not available yet.")
}
