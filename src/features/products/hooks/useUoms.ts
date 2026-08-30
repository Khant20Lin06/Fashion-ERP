import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import { createUom, deleteUom, fetchUoms, setUomStatus, updateUom } from "../api/uom.api"
import type { UomFormValues } from "../schemas/product.schema"

export function useUoms() {
  return useQuery({
    queryKey: ["uoms"],
    queryFn: () => fetchUoms(),
  })
}

export function useCreateUom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UomFormValues) => createUom(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms"] })
      toast.success("UOM created")
    },
    onError: (error) => toastApiError(error, "Failed to create UOM"),
  })
}

export function useUpdateUom(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UomFormValues) => updateUom(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms"] })
      toast.success("UOM updated")
    },
    onError: (error) => toastApiError(error, "Failed to update UOM"),
  })
}

export function useDeleteUom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms"] })
      toast.success("UOM deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete UOM"),
  })
}

export function useSetUomStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setUomStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms"] })
      toast.success("UOM status updated")
    },
    onError: (error) => toastApiError(error, "Failed to update UOM status"),
  })
}
