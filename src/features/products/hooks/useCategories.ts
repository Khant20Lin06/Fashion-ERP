import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  setCategoryStatus,
  updateCategory,
} from "../api/category.api"
import type { CategoryFormValues } from "../schemas/product.schema"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CategoryFormValues) => createCategory(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category created")
    },
    onError: (error) => toastApiError(error, "Failed to create category"),
  })
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CategoryFormValues) => updateCategory(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category updated")
    },
    onError: (error) => toastApiError(error, "Failed to update category"),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete category"),
  })
}

export function useSetCategoryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setCategoryStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category status updated")
    },
    onError: (error) => toastApiError(error, "Failed to update category status"),
  })
}
