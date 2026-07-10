"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { POSProductCard } from "@/components/sales/POSProductCard"
import { useAllProductsFull } from "@/features/products/hooks/useProducts"
import { useCategories } from "@/features/products/hooks/useCategories"
import { useCartStore } from "../stores/cart.store"
import { VariantPickerDialog } from "./VariantPickerDialog"
import type { Product, ProductVariant } from "@/features/products/types"

/** POS product search (name/SKU/barcode) + category filter + tappable product grid. */
export function POSProductGrid() {
  const { data: products, isLoading } = useAllProductsFull()
  const { data: categories } = useCategories()
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const [pickerProduct, setPickerProduct] = useState<Product | undefined>(undefined)
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

  function handleProductClick(product: Product) {
    if (product.variants.length > 0) {
      setPickerProduct(product)
      return
    }
    addItem({
      id: product.id,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      imageUrl: primaryImage(product),
      price: product.pricing.sellingPrice,
      availableStock: product.stockQuantity,
    })
  }

  function handleVariantConfirm(product: Product, variant: ProductVariant) {
    addItem({
      id: variant.id,
      productId: product.id,
      productName: product.name,
      sku: variant.sku,
      imageUrl: variant.imageUrl ?? primaryImage(product),
      color: variant.attributes.color,
      size: variant.attributes.size,
      price: variant.sellingPrice,
      availableStock: variant.stockQuantity,
    })
    setPickerProduct(undefined)
  }

  return (
    <div className="flex max-h-full flex-col gap-4">
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

      <div className="min-h-0 overflow-y-auto">
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
                imageUrl={primaryImage(product)}
                name={product.name}
                variantLabel={product.variants.length > 0 ? `${product.variants.length} options` : undefined}
                price={product.pricing.sellingPrice}
                stockAvailable={product.stockQuantity}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        )}
      </div>

      <VariantPickerDialog
        product={pickerProduct}
        open={!!pickerProduct}
        onOpenChange={(open) => !open && setPickerProduct(undefined)}
        onConfirm={(variant) => pickerProduct && handleVariantConfirm(pickerProduct, variant)}
      />
    </div>
  )
}

function primaryImage(product: Product): string | undefined {
  return product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
}
