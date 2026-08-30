import type { Category, PriceListItem, Product } from "@/features/products/types"

type PosCategory = Pick<Category, "id" | "name" | "parentId" | "isActive">
type ProductWithCategory = Pick<Product, "categoryName" | "variants">

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

export function resolveVisiblePosCategories<TCategory extends PosCategory, TProduct extends ProductWithCategory>(
  categories: TCategory[] | undefined,
  products: TProduct[] | undefined,
  priceListItems: PriceListItem[],
  transactionDate: string,
): TCategory[] {
  if (!categories?.length || !products?.length) {
    return []
  }

  const activeLeafCategories = categories.filter((category) => category.isActive)
  const parentIds = new Set(activeLeafCategories.map((category) => category.parentId).filter(Boolean))
  const leafCategories = activeLeafCategories.filter((category) => !parentIds.has(category.id))
  const variantIds = new Set(products.flatMap((product) => product.variants.map((variant) => variant.id)))
  const sellableVariantIds = new Set(
    priceListItems
      .filter((item) => variantIds.has(item.productVariantId))
      .filter((item) => isEffectiveActivePrice(item, transactionDate))
      .map((item) => item.productVariantId),
  )
  const visibleCategoryNames = new Set(
    products
      .filter((product) => product.variants.some((variant) => sellableVariantIds.has(variant.id)))
      .map((product) => product.categoryName),
  )

  return leafCategories.filter((category) => visibleCategoryNames.has(category.name))
}

export function hasVisibleCategory<TCategory extends Pick<Category, "name">>(
  selectedCategoryName: string | undefined,
  categories: TCategory[],
): boolean {
  if (!selectedCategoryName) {
    return true
  }

  return categories.some((category) => category.name === selectedCategoryName)
}
