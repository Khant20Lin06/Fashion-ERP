import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createSalesOrder,
  fetchSalesPriceLists,
  fetchCustomerAnalyticsSummary,
  fetchProductPerformance,
  fetchRevenueTrend,
  fetchSalesKpis,
  fetchSalesOrderById,
  fetchSalesOrders,
  updateSalesOrderStatus,
} from "../api/sales.api"
import type { SalesOrderFormValues } from "../schemas/sales.schema"
import type { RevenueTrendGranularity, SalesOrderStatus, SalesReportFilters } from "../types"

// --- Sales Orders ---

export function useSalesOrders() {
  return useQuery({
    queryKey: ["sales-orders"],
    queryFn: () => fetchSalesOrders(),
  })
}

export function useSalesOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["sales-orders", id],
    queryFn: () => fetchSalesOrderById(id as string),
    enabled: !!id,
  })
}

export function useSalesPriceLists() {
  return useQuery({
    queryKey: ["sales", "pricing", "price-lists"],
    queryFn: () => fetchSalesPriceLists(),
  })
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: SalesOrderFormValues) => createSalesOrder(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      toast.success("Sales order created")
    },
    onError: (error) => toastApiError(error, "Failed to create sales order"),
  })
}

export function useUpdateSalesOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SalesOrderStatus }) => updateSalesOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      // confirm/cancel both mutate stock server-side (confirm locks
      // inventory, cancel releases it) — matches useCheckout's invalidation.
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
      toast.success("Sales order updated")
    },
    onError: (error) => toastApiError(error, "Failed to update sales order"),
  })
}

// --- Dashboard / Analytics ---

export function useSalesKpis() {
  return useQuery({
    queryKey: ["sales", "kpis"],
    queryFn: () => fetchSalesKpis(),
  })
}

export function useRevenueTrend(granularity: RevenueTrendGranularity, filters?: SalesReportFilters) {
  return useQuery({
    queryKey: ["sales", "analytics", "revenue-trend", granularity, filters?.branchId ?? null, filters?.fromDate ?? null, filters?.toDate ?? null],
    queryFn: () => fetchRevenueTrend(granularity, filters),
  })
}

export function useProductPerformance(filters?: SalesReportFilters) {
  return useQuery({
    queryKey: ["sales", "analytics", "product-performance", filters?.branchId ?? null, filters?.fromDate ?? null, filters?.toDate ?? null],
    queryFn: () => fetchProductPerformance(filters),
  })
}

export function useCustomerAnalyticsSummary(filters?: SalesReportFilters) {
  return useQuery({
    queryKey: ["sales", "analytics", "customers", filters?.branchId ?? null, filters?.fromDate ?? null, filters?.toDate ?? null],
    queryFn: () => fetchCustomerAnalyticsSummary(filters),
  })
}
