import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type {
  AuditEntry,
  BalanceSheet,
  CashFlowStatement,
  FinanceKpis,
  IncomeExpensePoint,
  JournalEntry,
  JournalStatus,
  LedgerEntry,
  ProfitAndLoss,
} from "../types"
import type { JournalEntryFormValues } from "../schemas/journal.schema"
import {
  balanceSheet,
  cashFlowStatement,
  financeKpis,
  incomeVsExpense,
  mockAuditEntries,
  mockJournalEntries,
  mockLedgerEntries,
  profitAndLoss,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Journal Entries ---

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  if (USE_MOCK) return delay(mockJournalEntries)
  const { data } = await apiClient.get<JournalEntry[]>("/accounting/journal")
  return data
}

export async function createJournalEntry(values: JournalEntryFormValues): Promise<JournalEntry> {
  if (USE_MOCK) {
    return delay({
      id: `je-${Date.now()}`,
      reference: values.reference,
      date: values.date,
      description: values.description,
      lines: values.lines.map((line, index) => ({ id: `jl-${Date.now()}-${index}`, ...line })),
      status: "draft",
      createdBy: "You",
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<JournalEntry>("/accounting/journal", values)
  return data
}

export async function updateJournalEntryStatus(id: string, status: JournalStatus): Promise<JournalEntry> {
  if (USE_MOCK) {
    const existing = mockJournalEntries.find((j) => j.id === id)
    if (!existing) throw new Error("Journal entry not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<JournalEntry>(`/accounting/journal/${id}/status`, { status })
  return data
}

// --- General Ledger ---

export async function fetchLedgerEntries(): Promise<LedgerEntry[]> {
  if (USE_MOCK) return delay(mockLedgerEntries)
  const { data } = await apiClient.get<LedgerEntry[]>("/accounting/ledger")
  return data
}

// --- Financial Statements ---

export async function fetchProfitAndLoss(): Promise<ProfitAndLoss> {
  if (USE_MOCK) return delay(profitAndLoss)
  const { data } = await apiClient.get<ProfitAndLoss>("/accounting/statements/profit-and-loss")
  return data
}

export async function fetchBalanceSheet(): Promise<BalanceSheet> {
  if (USE_MOCK) return delay(balanceSheet)
  const { data } = await apiClient.get<BalanceSheet>("/accounting/statements/balance-sheet")
  return data
}

export async function fetchCashFlowStatement(): Promise<CashFlowStatement> {
  if (USE_MOCK) return delay(cashFlowStatement)
  const { data } = await apiClient.get<CashFlowStatement>("/accounting/statements/cash-flow")
  return data
}

// --- Finance Dashboard ---

export async function fetchFinanceKpis(): Promise<FinanceKpis> {
  if (USE_MOCK) return delay(financeKpis)
  const { data } = await apiClient.get<FinanceKpis>("/accounting/kpis")
  return data
}

export async function fetchIncomeVsExpense(): Promise<IncomeExpensePoint[]> {
  if (USE_MOCK) return delay(incomeVsExpense)
  const { data } = await apiClient.get<IncomeExpensePoint[]>("/accounting/analytics/income-vs-expense")
  return data
}

// --- Audit Log ---

export async function fetchAuditEntries(): Promise<AuditEntry[]> {
  if (USE_MOCK) return delay(mockAuditEntries)
  const { data } = await apiClient.get<AuditEntry[]>("/accounting/audit")
  return data
}
