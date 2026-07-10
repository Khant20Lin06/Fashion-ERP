"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProductVariant } from "@/features/products/types"

type VariantSelectorProps = {
  variants: ProductVariant[]
  value: string | undefined
  onChange: (variantId: string) => void
  placeholder?: string
}

function variantLabel(variant: ProductVariant) {
  return [variant.attributes.color, variant.attributes.size, variant.attributes.style, variant.attributes.material]
    .filter(Boolean)
    .join(" / ")
}

/** Dropdown for picking a single variant, e.g. on the POS or stock-adjustment screens. */
export function VariantSelector({ variants, value, onChange, placeholder = "Select variant" }: VariantSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {variants.map((variant) => (
          <SelectItem key={variant.id} value={variant.id}>
            {variantLabel(variant)} · {variant.sku}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
