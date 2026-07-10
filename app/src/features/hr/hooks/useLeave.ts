import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createLeaveRequest,
  fetchLeaveBalances,
  fetchLeaveDashboardMetrics,
  fetchLeaveRequests,
  updateLeaveRequestStatus,
} from "../api/leave.api"
import type { LeaveRequestFormValues } from "../schemas/leave.schema"
import type { LeaveStatus } from "../types"

export function useLeaveRequests() {
  return useQuery({ queryKey: ["hr", "leaves"], queryFn: fetchLeaveRequests })
}

export function useLeaveDashboardMetrics() {
  return useQuery({ queryKey: ["hr", "leaves", "metrics"], queryFn: fetchLeaveDashboardMetrics })
}

export function useLeaveBalances(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["hr", "leaves", "balances", employeeId],
    queryFn: () => fetchLeaveBalances(employeeId as string),
    enabled: !!employeeId,
  })
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: LeaveRequestFormValues) => createLeaveRequest(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "leaves"] })
      toast.success("Leave request submitted")
    },
    onError: () => toast.error("Failed to submit leave request"),
  })
}

export function useUpdateLeaveRequestStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeaveStatus }) => updateLeaveRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "leaves"] })
      toast.success("Leave request updated")
    },
    onError: () => toast.error("Failed to update leave request"),
  })
}
