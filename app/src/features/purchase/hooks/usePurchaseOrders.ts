import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createPurchaseOrder,
  createPurchaseRequest,
  fetchProductCostAnalysis,
  fetchPurchaseKpis,
  fetchPurchaseOrderById,
  fetchPurchaseOrders,
  fetchPurchaseRequests,
  fetchPurchaseTrend,
  updatePurchaseOrderStatus,
  updatePurchaseRequestStatus,
} from "../api/purchase-order.api"
import type { PurchaseOrderFormValues, PurchaseRequestFormValues } from "../schemas/purchase.schema"
import type { PurchaseOrderStatus, PurchaseRequest } from "../types"

// --- Purchase Requests ---

export function usePurchaseRequests() {
  return useQuery({
    queryKey: ["purchase-requests"],
    queryFn: fetchPurchaseRequests,
  })
}

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PurchaseRequestFormValues) => createPurchaseRequest(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
      toast.success("Purchase request created")
    },
    onError: () => toast.error("Failed to create purchase request"),
  })
}

export function useUpdatePurchaseRequestStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PurchaseRequest["status"] }) =>
      updatePurchaseRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
      toast.success("Purchase request updated")
    },
    onError: () => toast.error("Failed to update purchase request"),
  })
}

// --- Purchase Orders ---

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ["purchase-orders"],
    queryFn: fetchPurchaseOrders,
  })
}

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["purchase-orders", id],
    queryFn: () => fetchPurchaseOrderById(id as string),
    enabled: !!id,
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PurchaseOrderFormValues) => createPurchaseOrder(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      toast.success("Purchase order created")
    },
    onError: () => toast.error("Failed to create purchase order"),
  })
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PurchaseOrderStatus }) => updatePurchaseOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      toast.success("Purchase order updated")
    },
    onError: () => toast.error("Failed to update purchase order"),
  })
}

// --- Dashboard / Analytics ---

export function usePurchaseKpis() {
  return useQuery({
    queryKey: ["purchase", "kpis"],
    queryFn: fetchPurchaseKpis,
  })
}

export function usePurchaseTrend() {
  return useQuery({
    queryKey: ["purchase", "analytics", "trend"],
    queryFn: fetchPurchaseTrend,
  })
}

export function useProductCostAnalysis() {
  return useQuery({
    queryKey: ["purchase", "analytics", "product-cost"],
    queryFn: fetchProductCostAnalysis,
  })
}
