/** Core domain types for the Fashion Product Management module. */

export type ProductStatus = "active" | "draft" | "archived"
export type ProductType = "simple" | "variant"
export type Gender = "men" | "women" | "kids" | "unisex"
export type Season = "spring_summer" | "autumn_winter" | "all_season"

export type Category = {
  id: string
  name: string
  parentId: string | null
  isActive: boolean
  productCount: number
}

export type Brand = {
  id: string
  name: string
  logoUrl?: string
  country?: string
  description?: string
  isActive: boolean
  productCount: number
}

export type Collection = {
  id: string
  name: string
  season: Season
  year: number
  isActive: boolean
  productCount: number
}

/** Variant attribute dimensions supported by the Variant Builder. */
export type AttributeKind = "size" | "color" | "style" | "material"

export type AttributeOption = {
  id: string
  kind: AttributeKind
  value: string
  /** Hex swatch, only meaningful for the "color" kind. */
  swatch?: string
}

export type ProductImage = {
  id: string
  url: string
  isPrimary: boolean
  sortOrder: number
  /** Set when this image belongs to a specific variant rather than the product gallery. */
  variantId?: string
}

export type VariantStatus = "active" | "inactive"

export type ProductVariant = {
  id: string
  productId: string
  sku: string
  barcode: string
  attributes: Partial<Record<AttributeKind, string>>
  costPrice: number
  sellingPrice: number
  stockQuantity: number
  status: VariantStatus
  imageUrl?: string
}

export type WarehouseStock = {
  warehouseId: string
  warehouseName: string
  available: number
  reserved: number
  incoming: number
}

export type ProductPricing = {
  costPrice: number
  sellingPrice: number
  discountPrice?: number
  wholesalePrice?: number
  taxRate: number
}

export type ProductHistoryEntry = {
  id: string
  action: string
  detail: string
  actor: string
  timestamp: string
}

export type Product = {
  id: string
  name: string
  type: ProductType
  categoryId: string
  categoryName: string
  brandId: string
  brandName: string
  collectionId?: string
  collectionName?: string
  description?: string
  season: Season
  gender: Gender
  sku: string
  status: ProductStatus
  images: ProductImage[]
  variants: ProductVariant[]
  pricing: ProductPricing
  stockQuantity: number
  warehouseStock: WarehouseStock[]
  history: ProductHistoryEntry[]
  createdAt: string
  updatedAt: string
}

/** Row shape consumed by the Product Master DataTable (denormalized for column access). */
export type ProductListItem = {
  id: string
  imageUrl?: string
  name: string
  sku: string
  categoryName: string
  brandName: string
  variantCount: number
  stockQuantity: number
  sellingPrice: number
  status: ProductStatus
  createdAt: string
}

export type ProductFilters = {
  category?: string
  brand?: string
  status?: string
  stock?: string
}
