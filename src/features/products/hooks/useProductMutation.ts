import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import { createProduct, deleteProduct, updateProduct, updateProductStatus } from "../api/product.api"
import { toApiError } from "@/lib/api/errors"
import type { ProductFormValues } from "../schemas/product.schema"
import type { ProductStatus } from "../types"

function productErrorMessage(error: unknown, fallback: string): string {
  const apiError = toApiError(error)
  if (apiError.isValidation || apiError.isConflict) return apiError.message
  return fallback
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ProductFormValues) => createProduct(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product created successfully")
    },
    onError: (error) => toast.error(productErrorMessage(error, "Failed to create product")),
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ProductFormValues) => updateProduct(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["products", id] })
      toast.success("Product updated successfully")
    },
    onError: (error) => toast.error(productErrorMessage(error, "Failed to update product")),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete product"),
  })
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) => updateProductStatus(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success(status === "active" ? "Product activated" : "Product archived")
    },
    onError: (error) => toastApiError(error, "Failed to update product status"),
  })
}
