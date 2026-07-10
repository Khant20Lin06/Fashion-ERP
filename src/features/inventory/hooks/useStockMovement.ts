import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchStockAdjustments, createStockAdjustment, fetchStockCounts, submitStockCount, lookupBySku } from "../api/stock.api"
import { createTransfer, fetchTransfers, updateTransferStatus } from "../api/transfer.api"
import type { AdjustmentFormValues } from "../schemas/adjustment.schema"
import type { TransferFormValues } from "../schemas/transfer.schema"
import type { StockCountSession, TransferStatus } from "../types"
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
      toast.success("Stock adjustment submitted for approval")
    },
    onError: () => toast.error("Failed to submit adjustment"),
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
    onError: () => toast.error("Failed to submit stock count"),
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
      toast.success("Stock transfer created")
    },
    onError: () => toast.error("Failed to create transfer"),
  })
}

export function useUpdateTransferStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TransferStatus }) => updateTransferStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] })
      const messages: Record<TransferStatus, string> = {
        draft: "Transfer saved as draft",
        pending_approval: "Transfer submitted for approval",
        approved: "Transfer approved",
        completed: "Transfer completed — stock updated",
        cancelled: "Transfer cancelled",
      }
      toast.success(messages[variables.status])
    },
    onError: () => toast.error("Failed to update transfer"),
  })
}

export function useSkuLookup() {
  return useMutation({
    mutationFn: (sku: string) => lookupBySku(sku),
  })
}
