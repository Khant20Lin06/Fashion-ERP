import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createPayrollEntry,
  createPerformanceReview,
  fetchAbsenceTrend,
  fetchDepartmentCost,
  fetchHeadcountGrowth,
  fetchLateTrend,
  fetchPayrollDashboardMetrics,
  fetchPayrollEntries,
  fetchPerformanceReviews,
  fetchSalaryCostTrend,
  fetchTurnoverTrend,
  updatePayrollStatus,
} from "../api/payroll.api"
import type { PayrollEntryFormValues } from "../schemas/payroll.schema"
import type { PerformanceReviewFormValues } from "../schemas/performance.schema"
import type { PayrollStatus } from "../types"

// --- Payroll ---

export function usePayrollEntries() {
  return useQuery({ queryKey: ["hr", "payroll"], queryFn: fetchPayrollEntries })
}

export function usePayrollDashboardMetrics() {
  return useQuery({ queryKey: ["hr", "payroll", "metrics"], queryFn: fetchPayrollDashboardMetrics })
}

export function useCreatePayrollEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PayrollEntryFormValues) => createPayrollEntry(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "payroll"] })
      toast.success("Payroll entry created")
    },
    onError: () => toast.error("Failed to create payroll entry"),
  })
}

export function useUpdatePayrollStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PayrollStatus }) => updatePayrollStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "payroll"] })
      toast.success("Payroll status updated")
    },
    onError: () => toast.error("Failed to update payroll status"),
  })
}

// --- Performance ---

export function usePerformanceReviews() {
  return useQuery({ queryKey: ["hr", "performance"], queryFn: fetchPerformanceReviews })
}

export function useCreatePerformanceReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PerformanceReviewFormValues) => createPerformanceReview(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "performance"] })
      toast.success("Performance review saved")
    },
    onError: () => toast.error("Failed to save performance review"),
  })
}

// --- HR Analytics ---

export function useHeadcountGrowth() {
  return useQuery({ queryKey: ["hr", "analytics", "headcount-growth"], queryFn: fetchHeadcountGrowth })
}

export function useTurnoverTrend() {
  return useQuery({ queryKey: ["hr", "analytics", "turnover"], queryFn: fetchTurnoverTrend })
}

export function useLateTrend() {
  return useQuery({ queryKey: ["hr", "analytics", "late-trend"], queryFn: fetchLateTrend })
}

export function useAbsenceTrend() {
  return useQuery({ queryKey: ["hr", "analytics", "absence-trend"], queryFn: fetchAbsenceTrend })
}

export function useSalaryCostTrend() {
  return useQuery({ queryKey: ["hr", "analytics", "salary-cost"], queryFn: fetchSalaryCostTrend })
}

export function useDepartmentCost() {
  return useQuery({ queryKey: ["hr", "analytics", "department-cost"], queryFn: fetchDepartmentCost })
}
