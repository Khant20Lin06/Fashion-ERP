import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import { toApiError } from "@/lib/api/errors"
import { generateProductCode } from "../utils/generate-product-code"
import type { AttributeKind, AttributeOption, Product, ProductListItem, ProductVariant } from "../types"
import type { ProductFormValues } from "../schemas/product.schema"
import { mockProducts, toListItem } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH
const ATTRIBUTE_KINDS: AttributeKind[] = ["color", "size", "style", "material"]
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ---------- Backend DTO types ----------
type BackendProduct = {
  id: string
  companyId: string
  code: string
  name: string
  description: string | null
  categoryId: string
  brandId: string
  collectionId: string | null
  productType: string
  status: string
  createdAt: string
  updatedAt: string
}

type BackendVariant = {
  id: string
  productId: string
  companyId: string
  sku: string
  costPrice: string
  sellingPrice: string
  status: string
  attributes: Array<{
    kind: string
    optionId: string
    optionCode?: string
    optionValue?: string
    swatch?: string | null
  }>
  createdAt: string
  updatedAt: string
}

type BackendStock = {
  id: string
  productVariantId: string
  warehouseId: string
  onHandQuantity: number
  reservedQuantity: number
}

type ProductLookups = {
  categories: Array<{ id: string; name: string }>
  brands: Array<{ id: string; name: string }>
}

type BackendAttributeOption = {
  id: string
  code: string
  kind: string
  value: string
  status: string
}

type VariantAttributePayload = {
  kind: string
  optionId: string
}

// ---------- Request DTO types (must match backend CreateProductDto / UpdateProductDto exactly) ----------
type CreateProductVariantRequest = {
  sku: string
  costPrice: string
  sellingPrice: string
  attributes?: VariantAttributePayload[]
}

type CreateProductRequest = {
  companyId?: string
  code: string
  name: string
  description?: string
  categoryId: string
  brandId: string
  collectionId?: string
  productType?: "SIMPLE" | "VARIANT"
  initialVariant: CreateProductVariantRequest
}

type UpdateProductRequest = {
  name?: string
  description?: string
  categoryId?: string
  brandId?: string
  collectionId?: string
}

type UpdateProductVariantRequest = {
  costPrice?: string
  sellingPrice?: string
  attributes?: VariantAttributePayload[]
}

// ---------- Mappers ----------
function mapStatus(status: string): "active" | "draft" | "archived" {
  const map: Record<string, "active" | "draft" | "archived"> = {
    ACTIVE: "active",
    DRAFT: "draft",
    ARCHIVED: "archived",
    INACTIVE: "archived",
  }
  return map[status] ?? "draft"
}

function mapVariant(variant: BackendVariant, stockQty = 0): ProductVariant {
  const attrs: Partial<Record<string, string>> = {}
  for (const attribute of variant.attributes ?? []) {
    attrs[attribute.kind.toLowerCase()] = attribute.optionValue?.trim() || attribute.optionId
  }

  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    barcode: variant.sku,
    attributes: attrs,
    costPrice: parseFloat(variant.costPrice) || 0,
    sellingPrice: parseFloat(variant.sellingPrice) || 0,
    stockQuantity: stockQty,
    status: variant.status === "ACTIVE" ? "active" : "inactive",
  }
}

function mapBackendToProduct(
  product: BackendProduct,
  variants: BackendVariant[] = [],
  lookups: ProductLookups = { categories: [], brands: [] },
  stockMap: Record<string, number> = {},
): Product {
  const mappedVariants = variants.map((variant) => mapVariant(variant, stockMap[variant.id] ?? 0))
  const firstVariant = mappedVariants[0]
  const categoryName = lookups.categories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId
  const brandName = lookups.brands.find((brand) => brand.id === product.brandId)?.name ?? product.brandId

  return {
    id: product.id,
    code: product.code,
    name: product.name,
    type: product.productType === "VARIANT" ? "variant" : "simple",
    categoryId: product.categoryId,
    categoryName,
    brandId: product.brandId,
    brandName,
    collectionId: product.collectionId ?? undefined,
    description: product.description ?? undefined,
    season: "all_season",
    gender: "unisex",
    sku: firstVariant?.sku ?? product.code,
    status: mapStatus(product.status),
    images: [],
    variants: mappedVariants,
    pricing: {
      costPrice: firstVariant?.costPrice ?? 0,
      sellingPrice: firstVariant?.sellingPrice ?? 0,
      taxRate: 0,
    },
    stockQuantity: mappedVariants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
    warehouseStock: [],
    history: [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

function mapProductToListItem(product: Product): ProductListItem {
  return {
    id: product.id,
    imageUrl: product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
    name: product.name,
    sku: product.sku,
    categoryName: product.categoryName,
    brandName: product.brandName,
    variantCount: product.variants.length,
    stockQuantity: product.stockQuantity,
    sellingPrice: product.pricing.sellingPrice,
    status: product.status,
    createdAt: product.createdAt,
  }
}

function isPersistedVariantId(id: string): boolean {
  return UUID_PATTERN.test(id)
}

function normalizeVariantValue(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase()
}

function didVariantChange(current: ProductVariant, next: ProductVariant): boolean {
  if (current.costPrice !== next.costPrice) return true
  if (current.sellingPrice !== next.sellingPrice) return true
  if (current.status !== next.status) return true

  for (const kind of ATTRIBUTE_KINDS) {
    if (normalizeVariantValue(current.attributes[kind]) !== normalizeVariantValue(next.attributes[kind])) {
      return true
    }
  }

  return false
}

async function fetchProductLookups(companyId: string): Promise<ProductLookups> {
  const [categoriesRes, brandsRes] = await Promise.all([
    apiClient.get<{ data: Array<{ id: string; name: string }> }>("/categories", {
      params: { companyId, limit: 100 },
    }),
    apiClient.get<{ data: Array<{ id: string; name: string }> }>("/brands", {
      params: { companyId, limit: 100 },
    }),
  ])

  return {
    categories: categoriesRes.data.data ?? [],
    brands: brandsRes.data.data ?? [],
  }
}

async function fetchAttributeOptionsByKind(companyId: string): Promise<Record<AttributeKind, AttributeOption[]>> {
  const responses = await Promise.all(
    ATTRIBUTE_KINDS.map((kind) =>
      apiClient.get<{ data: BackendAttributeOption[] }>("/attribute-options", {
        params: { companyId, kind: kind.toUpperCase() },
      }),
    ),
  )

  return responses.reduce(
    (acc, response, index) => {
      const kind = ATTRIBUTE_KINDS[index]
      acc[kind] = (response.data.data ?? [])
        .filter((option) => option.status === "ACTIVE")
        .map((option) => ({
          id: option.id,
          kind,
          code: option.code,
          value: option.value,
          isActive: true,
        }))
      return acc
    },
    {
      color: [],
      size: [],
      style: [],
      material: [],
    } as Record<AttributeKind, AttributeOption[]>,
  )
}

async function fetchStockMap(companyId: string): Promise<Record<string, number>> {
  const stockMap: Record<string, number> = {}

  try {
    const pageSize = 100
    const { data: firstPage } = await apiClient.get<{
      data: BackendStock[]
      meta: { total: number; page: number; limit: number }
    }>("/warehouse-stock", { params: { companyId, limit: pageSize, page: 1 } })

    const accumulateStock = (rows: BackendStock[]) => {
      for (const row of rows) {
        stockMap[row.productVariantId] =
          (stockMap[row.productVariantId] ?? 0) + Math.max(0, row.onHandQuantity - row.reservedQuantity)
      }
    }

    accumulateStock(firstPage.data ?? [])

    const total = firstPage.meta?.total ?? 0
    const totalPages = Math.ceil(total / pageSize)

    if (totalPages > 1) {
      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          apiClient.get<{ data: BackendStock[] }>("/warehouse-stock", {
            params: { companyId, limit: pageSize, page: index + 2 },
          }),
        ),
      )

      for (const page of remainingPages) {
        accumulateStock(page.data.data ?? [])
      }
    }
  } catch {
    // Stock API failure should not block product rendering; rows fall
    // back to 0 stock until the inventory endpoint becomes available.
  }

  return stockMap
}

async function fetchVariantsForProduct(productId: string, companyId: string): Promise<BackendVariant[]> {
  try {
    const { data } = await apiClient.get<{ data: BackendVariant[]; meta: unknown }>(`/products/${productId}/variants`, {
      params: { companyId },
    })
    return data.data ?? []
  } catch {
    return []
  }
}

function mapVariantAttributesToPayload(
  variant: ProductVariant,
  optionsByKind: Record<AttributeKind, AttributeOption[]>,
): VariantAttributePayload[] {
  const attributes: VariantAttributePayload[] = []

  for (const kind of ATTRIBUTE_KINDS) {
    const selected = variant.attributes[kind]
    if (!selected) continue

    const normalized = normalizeVariantValue(selected)
    const option = (optionsByKind[kind] ?? []).find(
      (candidate) =>
        candidate.id === selected ||
        normalizeVariantValue(candidate.value) === normalized ||
        normalizeVariantValue(candidate.code) === normalized,
    )

    if (!option) {
      throw new Error(`Couldn't match ${kind} option "${selected}" to backend master data.`)
    }

    attributes.push({
      kind: kind.toUpperCase(),
      optionId: option.id,
    })
  }

  return attributes
}

async function syncProductStatus(
  productId: string,
  companyId: string,
  desiredStatus: Product["status"],
): Promise<BackendProduct> {
  if (desiredStatus === "active") {
    const { data } = await apiClient.post<BackendProduct>(`/products/${productId}/activate`, undefined, {
      params: { companyId },
    })
    return data
  }

  const { data } = await apiClient.post<BackendProduct>(`/products/${productId}/deactivate`, undefined, {
    params: { companyId },
  })
  return data
}

async function hydrateProduct(product: BackendProduct, companyId: string): Promise<Product> {
  const [lookups, stockMap, variants] = await Promise.all([
    fetchProductLookups(companyId),
    fetchStockMap(companyId),
    fetchVariantsForProduct(product.id, companyId),
  ])

  return mapBackendToProduct(product, variants, lookups, stockMap)
}

async function syncProductVariants(
  productId: string,
  companyId: string,
  nextVariants: ProductVariant[],
  currentVariants: ProductVariant[],
): Promise<void> {
  const optionsByKind = await fetchAttributeOptionsByKind(companyId)
  const currentById = new Map(currentVariants.filter((variant) => isPersistedVariantId(variant.id)).map((variant) => [variant.id, variant]))
  const persistedNextIds = new Set(
    nextVariants.filter((variant) => isPersistedVariantId(variant.id)).map((variant) => variant.id),
  )

  const removedVariants = currentVariants.filter(
    (variant) => isPersistedVariantId(variant.id) && !persistedNextIds.has(variant.id),
  )

  for (const variant of removedVariants) {
    await apiClient.delete(`/product-variants/${variant.id}`, { params: { companyId } })
  }

  for (const variant of nextVariants) {
    const attributes = mapVariantAttributesToPayload(variant, optionsByKind)

    if (!isPersistedVariantId(variant.id)) {
      const { data: created } = await apiClient.post<BackendVariant>(
        `/products/${productId}/variants`,
        {
          sku: variant.sku,
          costPrice: String(variant.costPrice),
          sellingPrice: String(variant.sellingPrice),
          attributes,
        } satisfies CreateProductVariantRequest,
        { params: { companyId } },
      )

      if (variant.status !== "active") {
        await apiClient.post(`/product-variants/${created.id}/deactivate`, undefined, {
          params: { companyId },
        })
      }
      continue
    }

    const current = currentById.get(variant.id)
    if (!current) continue
    if (!didVariantChange(current, variant)) continue

    await apiClient.patch(
      `/product-variants/${variant.id}`,
      {
        costPrice: String(variant.costPrice),
        sellingPrice: String(variant.sellingPrice),
        attributes,
      } satisfies UpdateProductVariantRequest,
      { params: { companyId } },
    )

    if (current.status !== variant.status) {
      const endpoint = variant.status === "active" ? "activate" : "deactivate"
      await apiClient.post(`/product-variants/${variant.id}/${endpoint}`, undefined, {
        params: { companyId },
      })
    }
  }
}

// ---------- Request payload mappers (form values -> exact backend DTO shape) ----------

/**
 * Builds the POST /products body. Backend's global ValidationPipe uses
 * forbidNonWhitelisted -- only properties declared on CreateProductDto may
 * be present, so this must not spread the raw form object.
 */
function mapProductFormToCreatePayload(values: ProductFormValues, companyId: string): CreateProductRequest {
  return {
    companyId,
    code: generateProductCode(),
    name: values.name,
    description: values.description || undefined,
    categoryId: values.categoryId,
    brandId: values.brandId,
    collectionId: values.collectionId || undefined,
    productType: values.type === "variant" ? "VARIANT" : "SIMPLE",
    initialVariant: {
      sku: values.sku,
      costPrice: String(values.costPrice),
      sellingPrice: String(values.sellingPrice),
    },
  }
}

/**
 * Builds the PATCH /products/:id body. UpdateProductDto deliberately omits
 * `code` and `productType` (immutable after creation, see backend comment)
 * and has no initialVariant -- variant edits go through
 * PATCH /product-variants/:id separately, out of this mapper's scope.
 */
function mapProductFormToUpdatePayload(values: ProductFormValues): UpdateProductRequest {
  return {
    name: values.name,
    description: values.description || undefined,
    categoryId: values.categoryId,
    brandId: values.brandId,
    collectionId: values.collectionId || undefined,
  }
}

// ---------- API functions ----------

export async function fetchProducts(): Promise<ProductListItem[]> {
  if (USE_MOCK) return delay(mockProducts.map(toListItem))
  const products = await fetchAllProductsFull()
  return products.map(mapProductToListItem)
}

/** Full product records (including nested variants) -- used by the POS grid and Variant overview. */
export async function fetchAllProductsFull(): Promise<Product[]> {
  if (USE_MOCK) return delay(mockProducts)
  const companyId = await resolveCompanyId()

  const [productsRes, lookups, stockMap] = await Promise.all([
    apiClient.get<{ data: BackendProduct[]; meta: unknown }>("/products", {
      params: { companyId, limit: 100 },
    }),
    fetchProductLookups(companyId),
    fetchStockMap(companyId),
  ])

  const backendProducts = productsRes.data.data ?? []

  return Promise.all(
    backendProducts.map(async (product) => {
      const variants = await fetchVariantsForProduct(product.id, companyId)
      return mapBackendToProduct(product, variants, lookups, stockMap)
    }),
  )
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  if (USE_MOCK) return delay(mockProducts.find((product) => product.id === id))
  const companyId = await resolveCompanyId()

  try {
    const { data } = await apiClient.get<BackendProduct>(`/products/${id}`, {
      params: { companyId },
    })
    return hydrateProduct(data, companyId)
  } catch {
    return undefined
  }
}

export async function createProduct(values: ProductFormValues): Promise<Product> {
  if (USE_MOCK) {
    const product: Product = {
      id: `prod-${Date.now()}`,
      name: values.name,
      type: values.type,
      categoryId: values.categoryId,
      categoryName: values.categoryId,
      brandId: values.brandId,
      brandName: values.brandId,
      collectionId: values.collectionId,
      description: values.description,
      season: values.season,
      gender: values.gender,
      sku: values.sku,
      status: values.status,
      images: [],
      variants: [],
      pricing: {
        costPrice: values.costPrice,
        sellingPrice: values.sellingPrice,
        discountPrice: values.discountPrice,
        wholesalePrice: values.wholesalePrice,
        taxRate: values.taxRate,
      },
      stockQuantity: 0,
      warehouseStock: [],
      history: [
        {
          id: `h-${Date.now()}`,
          action: "Created",
          detail: "Product created",
          actor: "You",
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return delay(product)
  }

  const companyId = await resolveCompanyId()
  const maxCodeRetries = 2
  let lastError: unknown

  for (let attempt = 0; attempt <= maxCodeRetries; attempt++) {
    const payload = mapProductFormToCreatePayload(values, companyId)

    try {
      const { data } = await apiClient.post<BackendProduct>("/products", payload)
      const synced = values.status === "active" ? data : await syncProductStatus(data.id, companyId, values.status)
      const hydrated = await hydrateProduct(synced, companyId)
      if ((values.variants?.length ?? 0) > 0) {
        await syncProductVariants(hydrated.id, companyId, values.variants ?? [], hydrated.variants)
        return (await fetchProductById(hydrated.id)) ?? hydrated
      }
      return hydrated
    } catch (error) {
      const apiError = toApiError(error)
      lastError = apiError
      if (!apiError.isConflict) throw apiError
    }
  }

  throw lastError
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<Product> {
  if (USE_MOCK) {
    const existing = mockProducts.find((product) => product.id === id)
    if (!existing) throw new Error("Product not found")
    return delay({ ...existing, ...values, updatedAt: new Date().toISOString() })
  }

  const companyId = await resolveCompanyId()
  const currentProduct = await fetchProductById(id)
  const payload = mapProductFormToUpdatePayload(values)
  const { data } = await apiClient.patch<BackendProduct>(`/products/${id}`, payload, {
    params: { companyId },
  })
  const synced = await syncProductStatus(data.id, companyId, values.status)
  const currentVariants = currentProduct?.variants ?? []
  await syncProductVariants(id, companyId, values.variants ?? currentVariants, currentVariants)
  return (await fetchProductById(synced.id)) ?? hydrateProduct(synced, companyId)
}

export async function updateProductStatus(id: string, status: Product["status"]): Promise<Product> {
  if (USE_MOCK) {
    const existing = mockProducts.find((product) => product.id === id)
    if (!existing) throw new Error("Product not found")
    return delay({ ...existing, status, updatedAt: new Date().toISOString() })
  }

  const companyId = await resolveCompanyId()
  const synced = await syncProductStatus(id, companyId, status)
  return hydrateProduct(synced, companyId)
}

export async function deleteProduct(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/products/${id}`, { params: { companyId } })
}

export async function checkSkuAvailability(sku: string, excludeProductId?: string): Promise<boolean> {
  if (USE_MOCK) {
    const taken = mockProducts.some(
      (product) => product.id !== excludeProductId && (product.sku === sku || product.variants.some((variant) => variant.sku === sku)),
    )
    return delay(!taken)
  }

  const { data } = await apiClient.get<{ available: boolean }>("/products/sku-check", {
    params: { sku, excludeProductId },
  })
  return data.available
}
