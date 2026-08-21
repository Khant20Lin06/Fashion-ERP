import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createPromotion,
  fetchPromotionById,
  fetchPromotions,
  updatePromotion,
  type CreatePromotionInput,
  type UpdatePromotionInput,
} from "../api/promotion.api"

export function usePromotions() {
  return useQuery({ queryKey: ["promotions"], queryFn: fetchPromotions })
}

export function usePromotion(id: string | undefined) {
  return useQuery({
    queryKey: ["promotions", id],
    queryFn: () => fetchPromotionById(id as string),
    enabled: !!id,
  })
}

export function useCreatePromotion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CreatePromotionInput) => createPromotion(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] })
      toast.success("Promotion created")
    },
    onError: (error) => toastApiError(error, "Failed to create promotion"),
  })
}

export function useUpdatePromotion(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UpdatePromotionInput) => updatePromotion(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] })
      toast.success("Promotion updated")
    },
    onError: (error) => toastApiError(error, "Failed to update promotion"),
  })
}

// No useDeletePromotion / useActivatePromotion / useDeactivatePromotion
// hooks — the real backend has no DELETE route and no dedicated
// activate/deactivate endpoint on Promotions. Status changes go through
// useUpdatePromotion with { status: "ACTIVE" | "INACTIVE" }.
