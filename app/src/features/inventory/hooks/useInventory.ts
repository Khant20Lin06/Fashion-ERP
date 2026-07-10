import { useQuery } from "@tanstack/react-query"
import {
  fetchCategoryStockDistribution,
  fetchInventory,
  fetchInventoryKpis,
  fetchMovementTrend,
  fetchStockValueByWarehouse,
} from "../api/inventory.api"

export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
  })
}

export function useInventoryKpis() {
  return useQuery({
    queryKey: ["inventory", "kpis"],
    queryFn: fetchInventoryKpis,
  })
}

export function useStockValueByWarehouse() {
  return useQuery({
    queryKey: ["inventory", "analytics", "stock-value"],
    queryFn: fetchStockValueByWarehouse,
  })
}

export function useCategoryStockDistribution() {
  return useQuery({
    queryKey: ["inventory", "analytics", "category-distribution"],
    queryFn: fetchCategoryStockDistribution,
  })
}

export function useMovementTrend() {
  return useQuery({
    queryKey: ["inventory", "analytics", "movement-trend"],
    queryFn: fetchMovementTrend,
  })
}
