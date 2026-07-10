import { apiClient } from "@/lib/api/client"
import type { Product, ProductListItem } from "../types"
import type { ProductFormValues } from "../schemas/product.schema"
import { mockProducts, toListItem } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchProducts(): Promise<ProductListItem[]> {
  if (USE_MOCK) return delay(mockProducts.map(toListItem))
  const { data } = await apiClient.get<ProductListItem[]>("/products")
  return data
}

/** Full product records (including nested variants) — used by the cross-product Variant overview. */
export async function fetchAllProductsFull(): Promise<Product[]> {
  if (USE_MOCK) return delay(mockProducts)
  const { data } = await apiClient.get<Product[]>("/products", { params: { full: true } })
  return data
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  if (USE_MOCK) return delay(mockProducts.find((p) => p.id === id))
  const { data } = await apiClient.get<Product>(`/products/${id}`)
  return data
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
      history: [{ id: `h-${Date.now()}`, action: "Created", detail: "Product created", actor: "You", timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return delay(product)
  }
  const { data } = await apiClient.post<Product>("/products", values)
  return data
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<Product> {
  if (USE_MOCK) {
    const existing = mockProducts.find((p) => p.id === id)
    if (!existing) throw new Error("Product not found")
    return delay({ ...existing, ...values, updatedAt: new Date().toISOString() })
  }
  const { data } = await apiClient.put<Product>(`/products/${id}`, values)
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/products/${id}`)
}

export async function checkSkuAvailability(sku: string, excludeProductId?: string): Promise<boolean> {
  if (USE_MOCK) {
    const taken = mockProducts.some(
      (p) => p.id !== excludeProductId && (p.sku === sku || p.variants.some((v) => v.sku === sku))
    )
    return delay(!taken)
  }
  const { data } = await apiClient.get<{ available: boolean }>("/products/sku-check", {
    params: { sku, excludeProductId },
  })
  return data.available
}
