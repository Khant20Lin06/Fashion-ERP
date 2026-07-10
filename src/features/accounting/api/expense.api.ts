import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { Expense, ExpenseStatus } from "../types"
import type { ExpenseFormValues } from "../schemas/expense.schema"
import { mockExpenses } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchExpenses(): Promise<Expense[]> {
  if (USE_MOCK) return delay(mockExpenses)
  const { data } = await apiClient.get<Expense[]>("/accounting/expenses")
  return data
}

export async function createExpense(values: ExpenseFormValues): Promise<Expense> {
  if (USE_MOCK) {
    return delay({
      id: `exp-${Date.now()}`,
      reference: `EXP-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      ...values,
      status: "submitted",
      submittedBy: "You",
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<Expense>("/accounting/expenses", values)
  return data
}

export async function updateExpenseStatus(id: string, status: ExpenseStatus): Promise<Expense> {
  if (USE_MOCK) {
    const existing = mockExpenses.find((e) => e.id === id)
    if (!existing) throw new Error("Expense not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<Expense>(`/accounting/expenses/${id}/status`, { status })
  return data
}
