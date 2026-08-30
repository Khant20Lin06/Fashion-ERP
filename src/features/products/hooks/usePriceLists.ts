import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createPriceList,
  createPriceListItem,
  deactivatePriceListItem,
  deletePriceList,
  deletePriceListItem,
  fetchPriceListItems,
  fetchPriceListItemsByFilter,
  fetchPriceLists,
  setPriceListStatus,
  updatePriceList,
  updatePriceListItem,
} from "../api/price-list.api"
import { clampPriceListItemsLimit } from "../api/price-list-query-limit"
import type { PriceListFormValues, PriceListItemFormValues } from "../schemas/product.schema"

function priceListsKey() {
  return ["price-lists"]
}

function priceListItemsKey(priceListId: string, filters?: { productVariantId?: string; uomId?: string; limit?: number }) {
  return [
    "price-lists",
    priceListId,
    "items",
    filters?.productVariantId ?? null,
    filters?.uomId ?? null,
    filters?.limit !== undefined ? clampPriceListItemsLimit(filters.limit) : null,
  ]
}

export function usePriceLists() {
  return useQuery({
    queryKey: priceListsKey(),
    queryFn: () => fetchPriceLists(),
  })
}

export function usePriceListItems(
  priceListId: string | undefined,
  filters?: { productVariantId?: string; uomId?: string; limit?: number },
) {
  const normalizedFilters = filters
    ? {
        ...filters,
        limit: clampPriceListItemsLimit(filters.limit),
      }
    : undefined

  return useQuery({
    queryKey: priceListId ? priceListItemsKey(priceListId, normalizedFilters) : ["price-lists", "empty", "items"],
    queryFn: () =>
      normalizedFilters
        ? fetchPriceListItemsByFilter(priceListId as string, normalizedFilters)
        : fetchPriceListItems(priceListId as string),
    enabled: !!priceListId,
  })
}

export function useCreatePriceList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PriceListFormValues) => createPriceList(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceListsKey() })
      toast.success("Price list created")
    },
    onError: (error) => toastApiError(error, "Failed to create price list"),
  })
}

export function useUpdatePriceList(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PriceListFormValues) => updatePriceList(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceListsKey() })
      toast.success("Price list updated")
    },
    onError: (error) => toastApiError(error, "Failed to update price list"),
  })
}

export function useSetPriceListStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setPriceListStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceListsKey() })
      toast.success("Price list status updated")
    },
    onError: (error) => toastApiError(error, "Failed to update price list status"),
  })
}

export function useDeletePriceList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePriceList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceListsKey() })
      toast.success("Price list deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete price list"),
  })
}

export function useCreatePriceListItem(priceListId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PriceListItemFormValues) => createPriceListItem(priceListId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceListItemsKey(priceListId) })
      toast.success("Price row created")
    },
    onError: (error) => toastApiError(error, "Failed to create price row"),
  })
}

export function useUpdatePriceListItem(priceListId: string, id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: PriceListItemFormValues) => updatePriceListItem(priceListId, id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceListItemsKey(priceListId) })
      toast.success("Price row updated")
    },
    onError: (error) => toastApiError(error, "Failed to update price row"),
  })
}

export function useDeactivatePriceListItem(priceListId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivatePriceListItem(priceListId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceListItemsKey(priceListId) })
      toast.success("Price row deactivated")
    },
    onError: (error) => toastApiError(error, "Failed to deactivate price row"),
  })
}

export function useDeletePriceListItem(priceListId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePriceListItem(priceListId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceListItemsKey(priceListId) })
      toast.success("Price row deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete price row"),
  })
}
