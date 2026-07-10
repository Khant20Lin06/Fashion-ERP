"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { POSProductCard } from "@/components/sales/POSProductCard"
import { useProducts } from "@/features/products/hooks/useProducts"
import { useCategories } from "@/features/products/hooks/useCategories"
import { useCartStore } from "../stores/cart.store"

/** POS product search (name/SKU/barcode) + category filter + tappable product grid. */
export function POSProductGrid() {
  const { data: products, isLoading } = useProducts()
  const { data: categories } = useCategories()
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const addItem = useCartStore((state) => state.addItem)

  const filtered = useMemo(() => {
    if (!products) return []
    const q = query.trim().toLowerCase()
    return products.filter((product) => {
      if (categoryFilter && product.categoryName !== categoryFilter) return false
      if (!q) return true
      return (
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q)
      )
    })
  }, [products, query, categoryFilter])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product by name, SKU, or scan barcode…"
            className="pl-9"
            autoFocus
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={categoryFilter === undefined ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setCategoryFilter(undefined)}
        >
          All
        </Badge>
        {(categories ?? [])
          .filter((c) => c.parentId !== null)
          .map((category) => (
            <Badge
              key={category.id}
              variant={categoryFilter === category.name ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategoryFilter(category.name)}
            >
              {category.name}
            </Badge>
          ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No products found" description="Try a different search term or category." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <POSProductCard
                key={product.id}
                imageUrl={product.imageUrl}
                name={product.name}
                price={product.sellingPrice}
                stockAvailable={product.stockQuantity}
                onClick={() =>
                  addItem({
                    id: product.id,
                    productId: product.id,
                    productName: product.name,
                    sku: product.sku,
                    imageUrl: product.imageUrl,
                    price: product.sellingPrice,
                    availableStock: product.stockQuantity,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
