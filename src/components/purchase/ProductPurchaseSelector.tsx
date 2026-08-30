"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAllProductsFull } from "@/features/products/hooks/useProducts"

type ProductPurchaseSelectorProps = {
  value: string | undefined
  onChange: (variantId: string) => void
  placeholder?: string
}

/** Variant dropdown for purchase request/return lines that must keep the real SKU identity. */
export function ProductPurchaseSelector({ value, onChange, placeholder = "Select product" }: ProductPurchaseSelectorProps) {
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
                {product.name} - {variant.sku}
              </SelectItem>
            )),
        )}
      </SelectContent>
    </Select>
  )
}
