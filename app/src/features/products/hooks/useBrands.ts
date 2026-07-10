import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createBrand, deleteBrand, fetchBrands, fetchCollections, updateBrand } from "../api/brand.api"
import type { BrandFormValues } from "../schemas/product.schema"

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  })
}

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: BrandFormValues) => createBrand(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("Brand created")
    },
    onError: () => toast.error("Failed to create brand"),
  })
}

export function useUpdateBrand(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: BrandFormValues) => updateBrand(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("Brand updated")
    },
    onError: () => toast.error("Failed to update brand"),
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("Brand deleted")
    },
    onError: () => toast.error("Failed to delete brand"),
  })
}
