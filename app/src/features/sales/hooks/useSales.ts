import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createSalesOrder,
  fetchCustomerAnalyticsSummary,
  fetchProductPerformance,
  fetchRevenueTrend,
  fetchSalesKpis,
  fetchSalesOrderById,
  fetchSalesOrders,
  updateSalesOrderStatus,
} from "../api/sales.api"
import type { SalesOrderFormValues } from "../schemas/sales.schema"
import type { RevenueTrendGranularity, SalesOrderStatus } from "../types"

// --- Sales Orders ---

export function useSalesOrders() {
  return useQuery({
    queryKey: ["sales-orders"],
    queryFn: fetchSalesOrders,
  })
}

export function useSalesOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["sales-orders", id],
    queryFn: () => fetchSalesOrderById(id as string),
    enabled: !!id,
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
    onError: () => toast.error("Failed to create sales order"),
  })
}

export function useUpdateSalesOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SalesOrderStatus }) => updateSalesOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      toast.success("Sales order updated")
    },
    onError: () => toast.error("Failed to update sales order"),
  })
}

// --- Dashboard / Analytics ---

export function useSalesKpis() {
  return useQuery({
    queryKey: ["sales", "kpis"],
    queryFn: fetchSalesKpis,
  })
}

export function useRevenueTrend(granularity: RevenueTrendGranularity) {
  return useQuery({
    queryKey: ["sales", "analytics", "revenue-trend", granularity],
    queryFn: () => fetchRevenueTrend(granularity),
  })
}

export function useProductPerformance() {
  return useQuery({
    queryKey: ["sales", "analytics", "product-performance"],
    queryFn: fetchProductPerformance,
  })
}

export function useCustomerAnalyticsSummary() {
  return useQuery({
    queryKey: ["sales", "analytics", "customers"],
    queryFn: fetchCustomerAnalyticsSummary,
  })
}
