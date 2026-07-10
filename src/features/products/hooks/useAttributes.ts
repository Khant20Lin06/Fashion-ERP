import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createAttributeOption,
  deleteAttributeOption,
  fetchAttributeOptions,
  updateAttributeOption,
} from "../api/attribute.api"
import type { AttributeOptionFormValues } from "../schemas/product.schema"
import type { AttributeKind } from "../types"

export function useAttributeOptionsByKind(kind: AttributeKind) {
  return useQuery({
    queryKey: ["product-attributes", kind],
    queryFn: () => fetchAttributeOptions(kind),
  })
}

export function useCreateAttributeOption(kind: AttributeKind) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AttributeOptionFormValues) => createAttributeOption(kind, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes", kind] })
      toast.success(`${kind === "size" ? "Size" : "Color"} added`)
    },
    onError: () => toast.error("Failed to add option"),
  })
}

export function useUpdateAttributeOption(id: string, kind: AttributeKind) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AttributeOptionFormValues) => updateAttributeOption(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes", kind] })
      toast.success(`${kind === "size" ? "Size" : "Color"} updated`)
    },
    onError: () => toast.error("Failed to update option"),
  })
}

export function useDeleteAttributeOption(kind: AttributeKind) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAttributeOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes", kind] })
      toast.success(`${kind === "size" ? "Size" : "Color"} deleted`)
    },
    onError: () => toast.error("Failed to delete option"),
  })
}
