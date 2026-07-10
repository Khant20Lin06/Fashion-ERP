"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/features/products/hooks/useProducts"

type ProductPurchaseSelectorProps = {
  value: string | undefined
  onChange: (productId: string) => void
  placeholder?: string
}

/** Dropdown for selecting a product to add to a Purchase Request/Order/Return line. */
export function ProductPurchaseSelector({ value, onChange, placeholder = "Select product" }: ProductPurchaseSelectorProps) {
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
