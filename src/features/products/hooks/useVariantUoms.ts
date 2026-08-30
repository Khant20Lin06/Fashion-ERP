import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createVariantUom,
  deleteVariantUom,
  fetchVariantUoms,
  setVariantUomStatus,
  updateVariantUom,
} from "../api/variant-uom.api"
import type { VariantUomMappingFormValues } from "../schemas/product.schema"

function key(variantId: string) {
  return ["variant-uoms", variantId]
}

export function useVariantUoms(variantId: string) {
  return useQuery({
    queryKey: key(variantId),
    queryFn: () => fetchVariantUoms(variantId),
    enabled: !!variantId,
  })
}

export function useCreateVariantUom(variantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: VariantUomMappingFormValues) => createVariantUom(variantId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(variantId) })
      toast.success("Variant UOM created")
    },
    onError: (error) => toastApiError(error, "Failed to create variant UOM"),
  })
}

export function useUpdateVariantUom(id: string, variantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: VariantUomMappingFormValues) => updateVariantUom(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(variantId) })
      toast.success("Variant UOM updated")
    },
    onError: (error) => toastApiError(error, "Failed to update variant UOM"),
  })
}

export function useDeleteVariantUom(variantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVariantUom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(variantId) })
      toast.success("Variant UOM deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete variant UOM"),
  })
}

export function useSetVariantUomStatus(variantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setVariantUomStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(variantId) })
      toast.success("Variant UOM status updated")
    },
    onError: (error) => toastApiError(error, "Failed to update variant UOM status"),
  })
}
