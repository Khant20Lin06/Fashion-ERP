import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import { fetchStockAdjustments, createStockAdjustment, fetchStockCounts, submitStockCount, lookupBySku } from "../api/stock.api"
import { createTransfer, fetchTransfers } from "../api/transfer.api"
import type { AdjustmentFormValues } from "../schemas/adjustment.schema"
import type { TransferFormValues } from "../schemas/transfer.schema"
import type { StockCountSession } from "../types"
import { fetchStockMovements } from "../api/stock.api"

export function useStockMovements() {
  return useQuery({
    queryKey: ["stock-movements"],
    queryFn: fetchStockMovements,
  })
}

export function useStockAdjustments() {
  return useQuery({
    queryKey: ["stock-adjustments"],
    queryFn: fetchStockAdjustments,
  })
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AdjustmentFormValues) => createStockAdjustment(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      toast.success("Stock adjustment applied")
    },
    onError: (error) => toastApiError(error, "Failed to submit adjustment"),
  })
}

export function useStockCounts() {
  return useQuery({
    queryKey: ["stock-counts"],
    queryFn: fetchStockCounts,
  })
}

export function useSubmitStockCount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, lines }: { sessionId: string; lines: StockCountSession["lines"] }) =>
      submitStockCount(sessionId, lines),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-counts"] })
      toast.success("Stock count submitted for approval")
    },
    onError: (error) => toastApiError(error, "Failed to submit stock count"),
  })
}

export function useTransfers() {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: fetchTransfers,
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: TransferFormValues) => createTransfer(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] })
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      toast.success("Stock transfer completed — stock updated")
    },
    onError: (error) => toastApiError(error, "Failed to create transfer"),
  })
}

export function useSkuLookup() {
  return useMutation({
    mutationFn: (sku: string) => lookupBySku(sku),
  })
}
