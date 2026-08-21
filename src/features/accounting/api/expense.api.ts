import { env } from "@/config/env"
import type { Expense, ExpenseStatus } from "../types"
import type { ExpenseFormValues } from "../schemas/expense.schema"
import { mockExpenses } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// No Expense entity, controller, or DTO exists anywhere in the backend —
// confirmed by a whole-repo grep (only hit is the unrelated AccountType.Expense
// enum value). Genuine BACKEND GAP, not a frontend bug: there is no
// `/accounting/expenses` (or any) route to call. Mock-only until such a
// concept is added server-side, matching the pattern already used for
// Purchase Invoices/Returns (Phase 5) and Discounts/Loyalty/Returns (Phase 6).

export async function fetchExpenses(): Promise<Expense[]> {
  if (USE_MOCK) return delay(mockExpenses)
  return []
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
  throw new Error("Expenses are not available yet.")
}

export async function updateExpenseStatus(id: string, status: ExpenseStatus): Promise<Expense> {
  if (USE_MOCK) {
    const existing = mockExpenses.find((e) => e.id === id)
    if (!existing) throw new Error("Expense not found")
    return delay({ ...existing, status })
  }
  throw new Error("Expenses are not available yet.")
}
