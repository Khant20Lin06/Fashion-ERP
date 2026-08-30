"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { POSProductCard } from "@/components/sales/POSProductCard"
import { useAllProductsFull } from "@/features/products/hooks/useProducts"
import { useCategories } from "@/features/products/hooks/useCategories"
import { usePriceListItems } from "@/features/products/hooks/usePriceLists"
import { MAX_PRICE_LIST_ITEMS_QUERY_LIMIT } from "@/features/products/api/price-list-query-limit"
import { useSalesPriceLists } from "../hooks/useSales"
import { useCartStore } from "../stores/cart.store"
import { hasVisibleCategory, resolveVisiblePosCategories } from "./pos-category-options"
import {
  buildPosNativeScrollRegionClassName,
  buildPosScrollablePaneClassName,
} from "./pos-layout.classes"
import { filterSellableProducts } from "./sellable-variants"
import { VariantPickerDialog, type PosVariantSelection } from "./VariantPickerDialog"
import type { Product } from "@/features/products/types"

/** POS product search (name/SKU/barcode) + category filter + tappable product grid. */
export function POSProductGrid() {
  const { data: products, isLoading, isError, refetch } = useAllProductsFull()
  const { data: categories } = useCategories()
  const { data: priceLists = [] } = useSalesPriceLists()
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const [pickerProduct, setPickerProduct] = useState<Product | undefined>(undefined)
  const addItem = useCartStore((state) => state.addItem)
  const priceListId = useCartStore((state) => state.priceListId)
  const effectivePriceListId = priceListId ?? (priceLists.length === 1 ? priceLists[0]?.id : undefined)
  const [transactionDate] = useState(() => new Date().toISOString())
  const {
    data: priceListItems = [],
    isLoading: isLoadingPriceListItems,
    isError: isPriceListItemsError,
    refetch: refetchPriceListItems,
  } = usePriceListItems(effectivePriceListId, {
    limit: MAX_PRICE_LIST_ITEMS_QUERY_LIMIT,
  })

  const priceListFilteredProducts = useMemo(() => {
    if (!products) {
      return []
    }
    if (!effectivePriceListId || isLoadingPriceListItems || isPriceListItemsError) {
      return products
    }
    return filterSellableProducts(products, priceListItems, transactionDate)
  }, [effectivePriceListId, isLoadingPriceListItems, isPriceListItemsError, priceListItems, products, transactionDate])

  const posCategories = useMemo(() => {
    if (!effectivePriceListId || isLoadingPriceListItems || isPriceListItemsError) {
      const cats = (categories ?? []).filter((c) => c.isActive)
      const parentIds = new Set(cats.map((c) => c.parentId).filter(Boolean))
      return cats.filter((c) => !parentIds.has(c.id))
    }

    return resolveVisiblePosCategories(categories ?? [], products ?? [], priceListItems, transactionDate)
  }, [categories, effectivePriceListId, isLoadingPriceListItems, isPriceListItemsError, priceListItems, products, transactionDate])

  useEffect(() => {
    if (!hasVisibleCategory(categoryFilter, posCategories)) {
      setCategoryFilter(undefined)
    }
  }, [categoryFilter, posCategories])

  const filtered = useMemo(() => {
    if (!priceListFilteredProducts.length) return []
    const q = query.trim().toLowerCase()
    return priceListFilteredProducts.filter((product) => {
      if (categoryFilter && product.categoryName !== categoryFilter) return false
      if (!q) return true
      return (
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q)
      )
    })
  }, [categoryFilter, priceListFilteredProducts, query])

  function handleProductClick(product: Product) {
    if (priceLists.length !== 1 && !priceListId) {
      toast.error("Select a sales price list before adding products.")
      return
    }
    // Every real product has at least one ProductVariant backend-side — an
    // empty variants array here means the per-product variants fetch
    // failed (silently swallowed upstream, see product.api.ts). Adding to
    // cart with a bare Product id would send an invalid productVariantId
    // at checkout, so refuse rather than accept a broken cart line.
    if (product.variants.length === 0) {
      toast.error(`Couldn't load ${product.name}'s variants — try refreshing.`)
      return
    }
    setPickerProduct(product)
  }

  function handleVariantConfirm(product: Product, selection: PosVariantSelection) {
    const { variant, quantity, uomId, uomLabel, unitPrice } = selection
    addItem({
      id: `${variant.id}:${uomId ?? "base"}`,
      productVariantId: variant.id,
      productId: product.id,
      productName: product.name,
      sku: variant.sku,
      uomId,
      uomLabel,
      imageUrl: variant.imageUrl ?? primaryImage(product),
      color: variant.attributes.color,
      size: variant.attributes.size,
      price: unitPrice,
      quantity,
      availableStock: variant.stockQuantity,
    })
    setPickerProduct(undefined)
  }

  return (
    <div className={buildPosScrollablePaneClassName("gap-4")}>
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
        {posCategories.map((category) => (
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

      <div className={buildPosNativeScrollRegionClassName("flex-1")}>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Couldn't load products." onRetry={refetch} />
        ) : effectivePriceListId && isPriceListItemsError ? (
          <ErrorState
            message="Couldn't load the selected sales price list items."
            onRetry={() => {
              void refetchPriceListItems()
            }}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              effectivePriceListId
                ? "No sellable products match this search for the selected sales price list."
                : "Try a different search term or category."
            }
          />
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
        priceListId={effectivePriceListId}
        open={!!pickerProduct}
        onOpenChange={(open) => !open && setPickerProduct(undefined)}
        onConfirm={(selection) => pickerProduct && handleVariantConfirm(pickerProduct, selection)}
      />
    </div>
  )
}

function primaryImage(product: Product): string | undefined {
  return product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
}
