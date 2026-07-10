import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createScheduledReport,
  deleteScheduledReport,
  fetchExecutiveInventoryHealth,
  fetchExecutiveKpis,
  fetchSalesPerformance,
  fetchScheduledReports,
  toggleScheduledReport,
  type ScheduledReportFormValues,
} from "../api/finance-report.api"

// --- Executive Dashboard ---

export function useExecutiveKpis() {
  return useQuery({ queryKey: ["reports", "executive", "kpis"], queryFn: fetchExecutiveKpis })
}

export function useSalesPerformance() {
  return useQuery({ queryKey: ["reports", "executive", "sales-performance"], queryFn: fetchSalesPerformance })
}

export function useExecutiveInventoryHealth() {
  return useQuery({ queryKey: ["reports", "executive", "inventory-health"], queryFn: fetchExecutiveInventoryHealth })
}

// --- Scheduled Reports ---

export function useScheduledReports() {
  return useQuery({ queryKey: ["reports", "scheduled"], queryFn: fetchScheduledReports })
}

export function useCreateScheduledReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ScheduledReportFormValues) => createScheduledReport(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", "scheduled"] })
      toast.success("Scheduled report created")
    },
    onError: () => toast.error("Failed to create scheduled report"),
  })
}

export function useToggleScheduledReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleScheduledReport(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", "scheduled"] })
      toast.success("Schedule updated")
    },
    onError: () => toast.error("Failed to update schedule"),
  })
}

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", "scheduled"] })
      toast.success("Scheduled report deleted")
    },
    onError: () => toast.error("Failed to delete scheduled report"),
  })
}
