"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/features/products/hooks/useProducts"

type ProductSelectorProps = {
  value: string | undefined
  onChange: (productId: string) => void
  placeholder?: string
}

/** Product picker for Purchase Order line items — surfaces product name, SKU, and current selling price as a cost hint. */
export function ProductSelector({ value, onChange, placeholder = "Select product" }: ProductSelectorProps) {
  const { data: products } = useProducts()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(products ?? []).map((product) => (
          <SelectItem key={product.id} value={product.id}>
            {product.name} — {product.sku}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
