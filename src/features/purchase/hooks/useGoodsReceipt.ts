import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import { createGoodsReceipt, fetchGoodsReceipts } from "../api/receipt.api"
import type { GoodsReceiptFormValues } from "../schemas/receipt.schema"

export function useGoodsReceipts() {
  return useQuery({
    queryKey: ["goods-receipts"],
    queryFn: fetchGoodsReceipts,
  })
}

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: GoodsReceiptFormValues) => createGoodsReceipt(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods-receipts"] })
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      queryClient.invalidateQueries({ queryKey: ["purchase", "kpis"] })
      queryClient.invalidateQueries({ queryKey: ["purchase", "analytics"] })
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
      toast.success("Goods receipt confirmed — inventory updated")
    },
    onError: (error) => toastApiError(error, "Failed to confirm goods receipt"),
  })
}
