import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createFinancePayment,
  fetchApMetrics,
  fetchArMetrics,
  fetchFinancePayments,
  fetchPayables,
  fetchReceivables,
} from "../api/payment.api"
import { createExpense, fetchExpenses } from "../api/expense.api"
import { createTaxRule, fetchTaxRules, toggleTaxRule, type TaxRuleFormValues } from "../api/tax.api"
import type { FinancePaymentFormValues } from "../schemas/payment.schema"
import type { ExpenseFormValues } from "../schemas/expense.schema"

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
    onError: (error) => toastApiError(error, "Failed to record payment"),
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
    onError: (error) => toastApiError(error, "Failed to submit expense"),
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
    onError: (error) => toastApiError(error, "Failed to create tax rule"),
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
    onError: (error) => toastApiError(error, "Failed to update tax rule"),
  })
}
