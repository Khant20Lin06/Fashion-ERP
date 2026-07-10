import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createFinancePayment,
  fetchApMetrics,
  fetchArMetrics,
  fetchFinancePayments,
  fetchPayables,
  fetchReceivables,
  updateFinancePaymentStatus,
} from "../api/payment.api"
import { createExpense, fetchExpenses, updateExpenseStatus } from "../api/expense.api"
import { createTaxRule, fetchTaxRules, toggleTaxRule, type TaxRuleFormValues } from "../api/tax.api"
import type { FinancePaymentFormValues } from "../schemas/payment.schema"
import type { ExpenseFormValues } from "../schemas/expense.schema"
import type { ExpenseStatus, FinancePaymentStatus } from "../types"

// --- Accounts Receivable ---

export function useReceivables() {
  return useQuery({ queryKey: ["accounting", "receivable"], queryFn: fetchReceivables })
}

export function useArMetrics() {
  return useQuery({ queryKey: ["accounting", "receivable", "metrics"], queryFn: fetchArMetrics })
}

// --- Accounts Payable ---

export function usePayables() {
  return useQuery({ queryKey: ["accounting", "payable"], queryFn: fetchPayables })
}

export function useApMetrics() {
  return useQuery({ queryKey: ["accounting", "payable", "metrics"], queryFn: fetchApMetrics })
}

// --- Payments ---

export function useFinancePayments() {
  return useQuery({ queryKey: ["accounting", "payments"], queryFn: fetchFinancePayments })
}

export function useCreateFinancePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: FinancePaymentFormValues) => createFinancePayment(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "payments"] })
      toast.success("Payment recorded")
    },
    onError: () => toast.error("Failed to record payment"),
  })
}

export function useUpdateFinancePaymentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FinancePaymentStatus }) => updateFinancePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "payments"] })
      toast.success("Payment status updated")
    },
    onError: () => toast.error("Failed to update payment"),
  })
}

// --- Expenses ---

export function useExpenses() {
  return useQuery({ queryKey: ["accounting", "expenses"], queryFn: fetchExpenses })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ExpenseFormValues) => createExpense(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "expenses"] })
      toast.success("Expense submitted")
    },
    onError: () => toast.error("Failed to submit expense"),
  })
}

export function useUpdateExpenseStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ExpenseStatus }) => updateExpenseStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "expenses"] })
      toast.success("Expense updated")
    },
    onError: () => toast.error("Failed to update expense"),
  })
}

// --- Taxes ---

export function useTaxRules() {
  return useQuery({ queryKey: ["accounting", "tax"], queryFn: fetchTaxRules })
}

export function useCreateTaxRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: TaxRuleFormValues) => createTaxRule(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "tax"] })
      toast.success("Tax rule created")
    },
    onError: () => toast.error("Failed to create tax rule"),
  })
}

export function useToggleTaxRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleTaxRule(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "tax"] })
      toast.success("Tax rule updated")
    },
    onError: () => toast.error("Failed to update tax rule"),
  })
}
