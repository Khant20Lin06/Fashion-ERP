import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  dispatchOnlineOrder,
  fetchOnlineOrders,
  fetchOnlineOrderById,
  settleOnlineOrderCod,
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

export function useDispatchOnlineOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: {
        courierService: string
        trackingNumber?: string
        codAmount?: string
        riderName?: string
        riderPhone?: string
      }
    }) => dispatchOnlineOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["online-orders"] })
      toast.success("Order dispatched for delivery")
    },
    onError: (error) => toastApiError(error, "Failed to dispatch order"),
  })
}

export function useSettleOnlineOrderCod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: {
        collectedAmount: string
        notes?: string
      }
    }) => settleOnlineOrderCod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["online-orders"] })
      toast.success("COD cash settled successfully")
    },
    onError: (error) => toastApiError(error, "Failed to settle COD"),
  })
}
