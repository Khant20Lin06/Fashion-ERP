import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createWarehouse,
  deleteWarehouse,
  fetchBranches,
  fetchWarehouses,
  updateWarehouse,
  type WarehouseFormValues,
} from "../api/warehouse.api"

export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: () => fetchWarehouses(),
  })
}

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: () => fetchBranches(),
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: WarehouseFormValues) => createWarehouse(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      toast.success("Warehouse created")
    },
    onError: (error) => toastApiError(error, "Failed to create warehouse"),
  })
}

export function useUpdateWarehouse(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: WarehouseFormValues) => updateWarehouse(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      toast.success("Warehouse updated")
    },
    onError: (error) => toastApiError(error, "Failed to update warehouse"),
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      toast.success("Warehouse deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete warehouse"),
  })
}
