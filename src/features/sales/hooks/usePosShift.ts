import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  closeShift,
  fetchCurrentShift,
  fetchShiftHistory,
  openShift,
} from "../api/pos-shift.api"

export function useCurrentShift(branchId?: string) {
  return useQuery({
    queryKey: ["pos-shifts", "current", branchId],
    queryFn: () => fetchCurrentShift(branchId),
    refetchInterval: 30000,
  })
}

export function useOpenShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { branchId: string; openingCash?: string; notes?: string }) =>
      openShift(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-shifts"] })
      toast.success("POS Shift opened successfully")
    },
    onError: (error) => toastApiError(error, "Failed to open POS shift"),
  })
}

export function useCloseShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      shiftId,
      payload,
    }: {
      shiftId: string
      payload: { actualCash: string; notes?: string }
    }) => closeShift(shiftId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-shifts"] })
      toast.success("POS Shift closed successfully")
    },
    onError: (error) => toastApiError(error, "Failed to close POS shift"),
  })
}

export function useShiftHistory(branchId?: string, limit = 20) {
  return useQuery({
    queryKey: ["pos-shifts", "history", branchId, limit],
    queryFn: () => fetchShiftHistory(branchId, limit),
  })
}
