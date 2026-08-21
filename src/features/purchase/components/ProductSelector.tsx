"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAllProductsFull } from "@/features/products/hooks/useProducts"

type ProductSelectorProps = {
  value: string | undefined
  onChange: (variantId: string) => void
  placeholder?: string
}

/** Product variant picker for Purchase Order line items — the backend's
 * CreatePurchaseOrderItemDto requires a productVariantId (not a Product
 * id), so this lists real variants (one row per SKU) rather than products,
 * even though every product in this ERP always has at least one variant. */
export function ProductSelector({ value, onChange, placeholder = "Select product" }: ProductSelectorProps) {
  const { data: products } = useAllProductsFull()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(products ?? []).flatMap((product) =>
          product.variants
            .filter((variant) => variant.status === "active")
            .map((variant) => (
              <SelectItem key={variant.id} value={variant.id}>
                {product.name} — {variant.sku}
              </SelectItem>
            ))
        )}
      </SelectContent>
    </Select>
  )
}
