import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createJournalEntry,
  fetchAuditEntries,
  fetchBalanceSheet,
  fetchCashFlowStatement,
  fetchFinanceKpis,
  fetchIncomeVsExpense,
  fetchJournalEntries,
  fetchLedgerEntries,
  fetchProfitAndLoss,
  updateJournalEntryStatus,
} from "../api/ledger.api"
import type { JournalEntryFormValues } from "../schemas/journal.schema"
import type { JournalStatus } from "../types"

// --- Journal Entries ---

export function useJournalEntries() {
  return useQuery({ queryKey: ["accounting", "journal"], queryFn: fetchJournalEntries })
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: JournalEntryFormValues) => createJournalEntry(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "journal"] })
      toast.success("Journal entry created")
    },
    onError: () => toast.error("Failed to create journal entry"),
  })
}

export function useUpdateJournalEntryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JournalStatus }) => updateJournalEntryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "journal"] })
      queryClient.invalidateQueries({ queryKey: ["accounting", "ledger"] })
      toast.success("Journal entry updated")
    },
    onError: () => toast.error("Failed to update journal entry"),
  })
}

// --- General Ledger ---

export function useLedgerEntries() {
  return useQuery({ queryKey: ["accounting", "ledger"], queryFn: fetchLedgerEntries })
}

// --- Financial Statements ---

export function useProfitAndLoss() {
  return useQuery({ queryKey: ["accounting", "statements", "profit-and-loss"], queryFn: fetchProfitAndLoss })
}

export function useBalanceSheet() {
  return useQuery({ queryKey: ["accounting", "statements", "balance-sheet"], queryFn: fetchBalanceSheet })
}

export function useCashFlowStatement() {
  return useQuery({ queryKey: ["accounting", "statements", "cash-flow"], queryFn: fetchCashFlowStatement })
}

// --- Finance Dashboard ---

export function useFinanceKpis() {
  return useQuery({ queryKey: ["accounting", "kpis"], queryFn: fetchFinanceKpis })
}

export function useIncomeVsExpense() {
  return useQuery({ queryKey: ["accounting", "analytics", "income-vs-expense"], queryFn: fetchIncomeVsExpense })
}

// --- Audit Log ---

export function useAuditEntries() {
  return useQuery({ queryKey: ["accounting", "audit"], queryFn: fetchAuditEntries })
}
