import type { PriceListItem, Product } from "@/features/products/types"

type ProductWithVariants = Pick<Product, "id" | "variants">

function isEffectiveActivePrice(item: PriceListItem, transactionDate: string) {
  if (item.status !== "ACTIVE") {
    return false
  }

  const atMs = Date.parse(transactionDate)
  const validFromMs = Date.parse(item.validFrom)
  if (Number.isNaN(atMs) || Number.isNaN(validFromMs) || validFromMs > atMs) {
    return false
  }

  if (!item.validTo) {
    return true
  }

  const validToMs = Date.parse(item.validTo)
  if (Number.isNaN(validToMs)) {
    return false
  }

  return validToMs > atMs
}

export function resolveSellableVariantIds(
  variantIds: string[],
  priceListItems: PriceListItem[],
  transactionDate: string,
): Set<string> {
  const candidateIds = new Set(variantIds)
  return new Set(
    priceListItems
      .filter((item) => candidateIds.has(item.productVariantId))
      .filter((item) => isEffectiveActivePrice(item, transactionDate))
      .map((item) => item.productVariantId),
  )
}

export function filterSellableProducts<T extends ProductWithVariants>(
  products: T[],
  priceListItems: PriceListItem[],
  transactionDate: string,
): T[] {
  const variantIds = products.flatMap((product) => product.variants.map((variant) => variant.id))
  const sellableVariantIds = resolveSellableVariantIds(variantIds, priceListItems, transactionDate)
  return products.filter((product) => product.variants.some((variant) => sellableVariantIds.has(variant.id)))
}
