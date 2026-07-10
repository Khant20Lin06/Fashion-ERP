import { useMemo } from "react"
import type { AttributeOption, ProductVariant } from "../types"
import { attributeOptions } from "../api/mock-data"

export function useAttributeOptions() {
  return useMemo(() => {
    const byKind: Record<string, AttributeOption[]> = {}
    for (const option of attributeOptions) {
      byKind[option.kind] ??= []
      byKind[option.kind].push(option)
    }
    return byKind
  }, [])
}

/** Cartesian-product variant generator used by the Variant Builder. */
export function generateVariantCombinations(
  selected: Partial<Record<"color" | "size" | "style" | "material", string[]>>
): Array<Partial<Record<"color" | "size" | "style" | "material", string>>> {
  const dimensions = (Object.entries(selected) as Array<[string, string[] | undefined]>).filter(
    ([, values]) => values && values.length > 0
  ) as Array<[string, string[]]>

  if (dimensions.length === 0) return []

  let combinations: Array<Record<string, string>> = [{}]
  for (const [kind, values] of dimensions) {
    const next: Array<Record<string, string>> = []
    for (const combo of combinations) {
      for (const value of values) {
        next.push({ ...combo, [kind]: value })
      }
    }
    combinations = next
  }
  return combinations
}

export function buildVariantSku(
  brandCode: string,
  categoryCode: string,
  attributes: Partial<Record<string, string>>,
  sequence: number
): string {
  const colorCode = attributes.color ? attributes.color.slice(0, 3).toUpperCase() : undefined
  const sizeCode = attributes.size?.toUpperCase()
  const parts = [brandCode, categoryCode, colorCode, sizeCode].filter(Boolean)
  parts.push(String(sequence).padStart(3, "0"))
  return parts.join("-")
}

export function totalVariantStock(variants: ProductVariant[]): number {
  return variants.reduce((sum, v) => sum + v.stockQuantity, 0)
}
