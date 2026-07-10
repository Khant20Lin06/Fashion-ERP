import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createProduct, deleteProduct, updateProduct } from "../api/product.api"
import type { ProductFormValues } from "../schemas/product.schema"

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ProductFormValues) => createProduct(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product created successfully")
    },
    onError: () => toast.error("Failed to create product"),
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
    onError: () => toast.error("Failed to update product"),
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
    onError: () => toast.error("Failed to delete product"),
  })
}
