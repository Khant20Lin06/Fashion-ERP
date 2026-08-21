import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import { createPayment, fetchInvoices, fetchPaymentMethods, fetchPayments } from "../api/payment.api"
import { createPurchaseReturn, fetchPurchaseReturns } from "../api/payment.api"
import type { PaymentFormValues, PurchaseReturnFormValues } from "../schemas/payment.schema"

export function useInvoices() {
  return useQuery({
    queryKey: ["purchase-invoices"],
    queryFn: fetchInvoices,
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: fetchPaymentMethods,
  })
}

export function usePayments() {
  return useQuery({
    queryKey: ["purchase-payments"],
    queryFn: fetchPayments,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PaymentFormValues) => createPayment(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-payments"] })
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] })
      queryClient.invalidateQueries({ queryKey: ["purchase", "kpis"] })
      queryClient.invalidateQueries({ queryKey: ["purchase", "analytics"] })
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      toast.success("Payment recorded")
    },
    onError: (error) => toastApiError(error, "Failed to record payment"),
  })
}

export function usePurchaseReturns() {
  return useQuery({
    queryKey: ["purchase-returns"],
    queryFn: fetchPurchaseReturns,
  })
}

export function useCreatePurchaseReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PurchaseReturnFormValues) => createPurchaseReturn(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-returns"] })
      toast.success("Purchase return submitted")
    },
    onError: (error) => toastApiError(error, "Failed to submit purchase return"),
  })
}
