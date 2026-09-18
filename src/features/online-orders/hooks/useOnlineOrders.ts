import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  fetchOnlineOrders,
  fetchOnlineOrderById,
  updateOnlineOrderStatus,
} from "../api/online-orders.api"
import type { OnlineOrderStatus } from "../types"

export function useOnlineOrders() {
  return useQuery({
    queryKey: ["online-orders"],
    queryFn: () => fetchOnlineOrders(),
  })
}

export function useOnlineOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["online-orders", id],
    queryFn: () => fetchOnlineOrderById(id as string),
    enabled: !!id,
  })
}

export function useUpdateOnlineOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OnlineOrderStatus }) => updateOnlineOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["online-orders"] })
      toast.success("Online order status updated")
    },
    onError: (error) => toastApiError(error, "Failed to update online order status"),
  })
}
