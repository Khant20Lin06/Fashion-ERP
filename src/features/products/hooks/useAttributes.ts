import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createAttributeOption,
  deleteAttributeOption,
  fetchAttributeOptions,
  setAttributeOptionStatus,
  updateAttributeOption,
} from "../api/attribute.api"
import type { AttributeOptionFormValues } from "../schemas/product.schema"
import type { AttributeKind } from "../types"

const kindLabel: Record<AttributeKind, string> = {
  size: "Size",
  color: "Color",
  style: "Style",
  material: "Material",
}

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
      toast.success(`${kindLabel[kind]} added`)
    },
    onError: (error) => toastApiError(error, "Failed to add option"),
  })
}

export function useUpdateAttributeOption(id: string, kind: AttributeKind) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AttributeOptionFormValues) => updateAttributeOption(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes", kind] })
      toast.success(`${kindLabel[kind]} updated`)
    },
    onError: (error) => toastApiError(error, "Failed to update option"),
  })
}

export function useDeleteAttributeOption(kind: AttributeKind) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAttributeOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes", kind] })
      toast.success(`${kindLabel[kind]} deleted`)
    },
    onError: (error) => toastApiError(error, "Failed to delete option"),
  })
}

export function useSetAttributeOptionStatus(kind: AttributeKind) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setAttributeOptionStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes", kind] })
      toast.success(`${kindLabel[kind]} ${variables.isActive ? "activated" : "deactivated"}`)
    },
    onError: (error) => toastApiError(error, "Failed to update option status"),
  })
}
