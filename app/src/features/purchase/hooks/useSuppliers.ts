import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createSupplier,
  deleteSupplier,
  fetchSupplierById,
  fetchSupplierPerformance,
  fetchSuppliers,
  updateSupplier,
} from "../api/supplier.api"
import type { SupplierFormValues } from "../schemas/supplier.schema"

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  })
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => fetchSupplierById(id as string),
    enabled: !!id,
  })
}

export function useSupplierPerformance(id: string | undefined) {
  return useQuery({
    queryKey: ["suppliers", id, "performance"],
    queryFn: () => fetchSupplierPerformance(id as string),
    enabled: !!id,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: SupplierFormValues) => createSupplier(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      toast.success("Supplier created")
    },
    onError: () => toast.error("Failed to create supplier"),
  })
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: SupplierFormValues) => updateSupplier(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      queryClient.invalidateQueries({ queryKey: ["suppliers", id] })
      toast.success("Supplier updated")
    },
    onError: () => toast.error("Failed to update supplier"),
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      toast.success("Supplier deleted")
    },
    onError: () => toast.error("Failed to delete supplier"),
  })
}
