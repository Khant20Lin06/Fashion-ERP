import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  checkoutCart,
  fetchDiscountRules,
  fetchInvoiceById,
  fetchInvoices,
  fetchLoyaltyTransactions,
  redeemLoyaltyPoints,
  toggleDiscountRule,
  type CheckoutPayload,
} from "../api/invoice.api"
import {
  createSalesReturn,
  fetchSalesReturns,
  updateSalesReturnStatus,
} from "../api/return.api"
import type { SalesReturnFormValues } from "../schemas/sales.schema"
import type { ReturnStatus } from "../types"

// --- Invoices ---

export function useInvoices() {
  return useQuery({
    queryKey: ["sales-invoices"],
    queryFn: fetchInvoices,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      toast.success("Sale completed — invoice generated")
    },
    onError: () => toast.error("Checkout failed"),
  })
}

// --- Discounts ---

export function useDiscountRules() {
  return useQuery({
    queryKey: ["discount-rules"],
    queryFn: fetchDiscountRules,
  })
}

export function useToggleDiscountRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleDiscountRule(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount-rules"] })
      toast.success("Discount rule updated")
    },
    onError: () => toast.error("Failed to update discount rule"),
  })
}

// --- Loyalty ---

export function useLoyaltyTransactions(customerId: string | undefined) {
  return useQuery({
    queryKey: ["loyalty", customerId],
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
    onError: () => toast.error("Failed to redeem points"),
  })
}

// --- Returns ---

export function useSalesReturns() {
  return useQuery({
    queryKey: ["sales-returns"],
    queryFn: fetchSalesReturns,
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
    onError: () => toast.error("Failed to submit return"),
  })
}

export function useUpdateSalesReturnStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReturnStatus }) => updateSalesReturnStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] })
      toast.success("Return updated")
    },
    onError: () => toast.error("Failed to update return"),
  })
}
