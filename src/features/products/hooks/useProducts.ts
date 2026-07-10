import { useQuery } from "@tanstack/react-query"
import { fetchAllProductsFull, fetchProductById, fetchProducts } from "../api/product.api"

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  })
}

/** Full product records (including nested variants) — used by the cross-product Variant overview. */
export function useAllProductsFull() {
  return useQuery({
    queryKey: ["products", "full"],
    queryFn: fetchAllProductsFull,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProductById(id as string),
    enabled: !!id,
  })
}
