import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  checkoutCart,
  fetchInvoiceById,
  fetchInvoices,
  fetchLoyaltyBalance,
  fetchLoyaltyTransactions,
  redeemLoyaltyPoints,
  type CheckoutPayload,
} from "../api/invoice.api"
import {
  createSalesReturn,
  fetchSalesReturns,
  updateSalesReturnStatus,
} from "../api/return.api"
import type { SalesReturnFormValues } from "../schemas/sales.schema"
import type { ReturnStatus, SalesReturn } from "../types"

// --- Invoices ---

export function useInvoices() {
  return useQuery({
    queryKey: ["sales-invoices"],
    queryFn: () => fetchInvoices(),
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ["sales-invoices", id],
    queryFn: () => fetchInvoiceById(id as string),
    enabled: !!id,
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => checkoutCart(payload),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      queryClient.invalidateQueries({ queryKey: ["sales", "kpis"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
      if (invoice.paymentRecordingFailed) {
        toast.warning("Sale completed, but the payment could not be recorded — check payment method setup.")
      } else {
        toast.success("Sale completed — invoice generated")
      }
    },
    onError: (error) => toastApiError(error, "Checkout failed"),
  })
}

// --- Loyalty ---

export function useLoyaltyBalance(customerId: string | undefined) {
  return useQuery({
    queryKey: ["loyalty", customerId, "balance"],
    queryFn: () => fetchLoyaltyBalance(customerId as string),
    enabled: !!customerId,
  })
}

export function useLoyaltyTransactions(customerId: string | undefined) {
  return useQuery({
    queryKey: ["loyalty", customerId, "transactions"],
    queryFn: () => fetchLoyaltyTransactions(customerId as string),
    enabled: !!customerId,
  })
}

export function useRedeemLoyaltyPoints(customerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (points: number) => redeemLoyaltyPoints(customerId, points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty", customerId] })
      toast.success("Points redeemed")
    },
    onError: (error) => toastApiError(error, "Failed to redeem points"),
  })
}

// --- Returns ---

export function useSalesReturns() {
  return useQuery({
    queryKey: ["sales-returns"],
    queryFn: () => fetchSalesReturns(),
  })
}

export function useCreateSalesReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: SalesReturnFormValues) => createSalesReturn(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] })
      toast.success("Return request submitted")
    },
    onError: (error) => toastApiError(error, "Failed to submit return"),
  })
}

export function useUpdateSalesReturnStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReturnStatus }) => updateSalesReturnStatus(id, status),
    onSuccess: (updatedReturn, { status }) => {
      queryClient.setQueryData<SalesReturn[] | undefined>(["sales-returns"], (current) =>
        current?.map((ret) =>
          ret.id === updatedReturn.id
            ? {
                ...ret,
                ...updatedReturn,
                customerName: updatedReturn.customerName || ret.customerName,
                invoiceNumber: updatedReturn.invoiceNumber || ret.invoiceNumber,
                saleWarehouseId: updatedReturn.saleWarehouseId ?? ret.saleWarehouseId,
                items: updatedReturn.items.length > 0 ? updatedReturn.items : ret.items,
              }
            : ret
        )
      )
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] })
      // Confirming a return restocks items per their return condition.
      if (status === "confirmed") {
        queryClient.invalidateQueries({ queryKey: ["inventory"] })
        queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      }
      toast.success("Return updated")
    },
    onError: (error) => toastApiError(error, "Failed to update return"),
  })
}
