import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { Account, AccountType } from "../types"
import { mockAccounts } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export type AccountFormValues = {
  name: string
  code: string
  type: AccountType
  parentId: string | null
  currency: string
  status: "active" | "inactive"
}

export async function fetchAccounts(): Promise<Account[]> {
  if (USE_MOCK) return delay(mockAccounts)
  const { data } = await apiClient.get<Account[]>("/accounting/accounts")
  return data
}

export async function createAccount(values: AccountFormValues): Promise<Account> {
  if (USE_MOCK) {
    return delay({ id: `acc-${Date.now()}`, ...values, balance: 0 })
  }
  const { data } = await apiClient.post<Account>("/accounting/accounts", values)
  return data
}

export async function updateAccount(id: string, values: AccountFormValues): Promise<Account> {
  if (USE_MOCK) {
    const existing = mockAccounts.find((a) => a.id === id)
    if (!existing) throw new Error("Account not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Account>(`/accounting/accounts/${id}`, values)
  return data
}

export async function deleteAccount(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/accounting/accounts/${id}`)
}
