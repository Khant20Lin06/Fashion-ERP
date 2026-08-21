import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { CategoryStockPoint, InventoryItem, InventoryKpis, MovementTrendPoint, StockValuePoint } from "../types"
import { categoryStockDistribution, mockInventory, movementTrend, stockValueByWarehouse } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real backend route is GET /reports/inventory/stock-summary (there is no
// /inventory or /inventory/kpis route at all — confirmed against the live
// controller inventory, erp-pos fashion api InventoryReportsController).
// It returns one row per (warehouse, product variant) with sku/quantities
// pre-joined, but no product name/color/size/image/cost/reorder-level —
// those aren't on this report at all, so productName/color/size below are
// resolved via a separate /products + /products/:id/variants join (same
// pattern as fetchAllProductsFull in features/products/api/product.api.ts)
// rather than invented.
type BackendStockSummaryRow = {
  warehouseId: string
  warehouseName: string
  productVariantId: string
  sku: string
  onHandQuantity: number
  reservedQuantity: number
}

type BackendProduct = { id: string; name: string }
type BackendVariant = {
  id: string
  productId: string
  attributes: Array<{ kind: string; optionId: string; optionValue?: string }>
}

type VariantLookupEntry = { productName: string; color?: string; size?: string }

async function buildVariantLookup(companyId: string): Promise<Map<string, VariantLookupEntry>> {
  const lookup = new Map<string, VariantLookupEntry>()
  const { data: productsRes } = await apiClient.get<{ data: BackendProduct[]; meta: unknown }>("/products", {
    params: { companyId, limit: 100 },
  })
  const products = productsRes.data ?? []

  await Promise.all(
    products.map(async (product) => {
      try {
        const { data: variantsRes } = await apiClient.get<{ data: BackendVariant[]; meta: unknown }>(
          `/products/${product.id}/variants`,
          { params: { companyId } },
        )
        for (const variant of variantsRes.data ?? []) {
          const attrs: Partial<Record<string, string>> = {}
          for (const a of variant.attributes ?? []) {
            attrs[a.kind.toLowerCase()] = a.optionValue?.trim() || a.optionId
          }
          lookup.set(variant.id, { productName: product.name, color: attrs.color, size: attrs.size })
        }
      } catch {
        // A single product's variants failing to load shouldn't block the
        // rest of the inventory list — those rows just fall back to sku.
      }
    }),
  )
  return lookup
}

function mapStockSummaryRow(row: BackendStockSummaryRow, lookup: Map<string, VariantLookupEntry>): InventoryItem {
  const variantInfo = lookup.get(row.productVariantId)
  return {
    id: `${row.warehouseId}:${row.productVariantId}`,
    productVariantId: row.productVariantId,
    productName: variantInfo?.productName ?? row.sku,
    sku: row.sku,
    color: variantInfo?.color,
    size: variantInfo?.size,
    warehouseId: row.warehouseId,
    warehouseName: row.warehouseName,
    availableQty: Math.max(0, row.onHandQuantity - row.reservedQuantity),
    reservedQty: row.reservedQuantity,
  }
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  if (USE_MOCK) return delay(mockInventory)
  const companyId = await resolveCompanyId()
  const [stockRes, lookup] = await Promise.all([
    apiClient.get<BackendStockSummaryRow[]>("/reports/inventory/stock-summary", { params: { companyId } }),
    buildVariantLookup(companyId).catch(() => new Map<string, VariantLookupEntry>()),
  ])
  return stockRes.data.map((row) => mapStockSummaryRow(row, lookup))
}

export async function fetchInventoryKpis(): Promise<InventoryKpis> {
  if (USE_MOCK) {
    const totalProducts = mockInventory.length
    const outOfStockItems = mockInventory.filter((i) => i.availableQty === 0).length
    return delay({ totalProducts, outOfStockItems })
  }
  const items = await fetchInventory()
  return {
    totalProducts: new Set(items.map((i) => i.productVariantId)).size,
    outOfStockItems: items.filter((i) => i.availableQty === 0).length,
  }
}

// The three analytics endpoints below have no backend counterpart at any
// path — no stock-valuation-by-warehouse report (would need a per-variant
// costPrice join no endpoint provides), no category-distribution report,
// and no movement-trend/incoming-vs-outgoing report exist anywhere in the
// backend. Real mode throws an honest error rather than fabricate chart
// data; the only consumer, /dashboard/inventory/reports, is registered in
// release-scope.ts as a BACKEND_GAP_ROUTE and unreachable in the shipped
// UI.

export async function fetchStockValueByWarehouse(): Promise<StockValuePoint[]> {
  if (USE_MOCK) return delay(stockValueByWarehouse)
  throw new Error("Stock value by warehouse is not available yet.")
}

export async function fetchCategoryStockDistribution(): Promise<CategoryStockPoint[]> {
  if (USE_MOCK) return delay(categoryStockDistribution)
  throw new Error("Category stock distribution is not available yet.")
}

export async function fetchMovementTrend(): Promise<MovementTrendPoint[]> {
  if (USE_MOCK) return delay(movementTrend)
  throw new Error("Movement trend analytics is not available yet.")
}
