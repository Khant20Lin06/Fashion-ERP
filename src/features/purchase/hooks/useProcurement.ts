import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createPurchaseRfq,
  createSupplierQuotation,
  fetchPurchaseRfqById,
  fetchPurchaseRfqs,
  fetchSupplierQuotationById,
  fetchSupplierQuotations,
  updatePurchaseRfqStatus,
  updateSupplierQuotationStatus,
} from "../api/procurement.api"
import type {
  PurchaseRfqFormValues,
  SupplierQuotationFormValues,
} from "../schemas/procurement.schema"
import type {
  RequestForQuotationStatus,
  SupplierQuotationStatus,
} from "../types"

export function usePurchaseRfqs() {
  return useQuery({
    queryKey: ["purchase-rfqs"],
    queryFn: fetchPurchaseRfqs,
  })
}

export function usePurchaseRfq(id: string | undefined) {
  return useQuery({
    queryKey: ["purchase-rfqs", id],
    queryFn: () => fetchPurchaseRfqById(id as string),
    enabled: !!id,
  })
}

export function useCreatePurchaseRfq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PurchaseRfqFormValues) => createPurchaseRfq(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-rfqs"] })
      toast.success("RFQ created")
    },
    onError: (error) => toastApiError(error, "Failed to create RFQ"),
  })
}

export function useUpdatePurchaseRfqStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestForQuotationStatus }) =>
      updatePurchaseRfqStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-rfqs"] })
      queryClient.invalidateQueries({ queryKey: ["purchase-rfqs", variables.id] })
      toast.success("RFQ updated")
    },
    onError: (error) => toastApiError(error, "Failed to update RFQ"),
  })
}

export function useSupplierQuotations(purchaseRfqId?: string) {
  return useQuery({
    queryKey: ["supplier-quotations", purchaseRfqId ?? "all"],
    queryFn: () => fetchSupplierQuotations(purchaseRfqId),
    enabled: !purchaseRfqId || purchaseRfqId.length > 0,
  })
}

export function useSupplierQuotation(id: string | undefined) {
  return useQuery({
    queryKey: ["supplier-quotations", id],
    queryFn: () => fetchSupplierQuotationById(id as string),
    enabled: !!id,
  })
}

export function useCreateSupplierQuotation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: SupplierQuotationFormValues) => createSupplierQuotation(values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supplier-quotations", variables.purchaseRfqId] })
      queryClient.invalidateQueries({ queryKey: ["purchase-rfqs"] })
      toast.success("Supplier quotation created")
    },
    onError: (error) => toastApiError(error, "Failed to create supplier quotation"),
  })
}

export function useUpdateSupplierQuotationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupplierQuotationStatus }) =>
      updateSupplierQuotationStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["supplier-quotations", data.purchaseRfqId] })
      queryClient.invalidateQueries({ queryKey: ["supplier-quotations", data.id] })
      queryClient.invalidateQueries({ queryKey: ["purchase-rfqs"] })
      toast.success("Supplier quotation updated")
    },
    onError: (error) => toastApiError(error, "Failed to update supplier quotation"),
  })
}
