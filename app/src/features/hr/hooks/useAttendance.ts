import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createShift,
  deleteShift,
  fetchAttendanceMetrics,
  fetchAttendanceOverview,
  fetchAttendanceRecords,
  fetchShifts,
  updateShift,
  type ShiftFormValues,
} from "../api/attendance.api"

// --- Attendance ---

export function useAttendanceRecords() {
  return useQuery({ queryKey: ["hr", "attendance"], queryFn: fetchAttendanceRecords })
}

export function useAttendanceMetrics() {
  return useQuery({ queryKey: ["hr", "attendance", "metrics"], queryFn: fetchAttendanceMetrics })
}

export function useAttendanceOverview() {
  return useQuery({ queryKey: ["hr", "attendance", "overview"], queryFn: fetchAttendanceOverview })
}

// --- Shifts ---

export function useShifts() {
  return useQuery({ queryKey: ["hr", "shifts"], queryFn: fetchShifts })
}

export function useCreateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ShiftFormValues) => createShift(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "shifts"] })
      toast.success("Shift created")
    },
    onError: () => toast.error("Failed to create shift"),
  })
}

export function useUpdateShift(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ShiftFormValues) => updateShift(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "shifts"] })
      toast.success("Shift updated")
    },
    onError: () => toast.error("Failed to update shift"),
  })
}

export function useDeleteShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "shifts"] })
      toast.success("Shift deleted")
    },
    onError: () => toast.error("Failed to delete shift"),
  })
}
