import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
      toast.success("Goods receipt confirmed — inventory updated")
    },
    onError: () => toast.error("Failed to confirm goods receipt"),
  })
}
