import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { GoodsReceipt } from "../types"
import type { GoodsReceiptFormValues } from "../schemas/receipt.schema"
import { mockGoodsReceipts, mockPurchaseOrders } from "./mock-data"
import { fetchPurchaseOrders } from "./purchase-order.api"
import { fetchWarehouses } from "@/features/inventory/api/warehouse.api"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real backend route is the top-level `/goods-receipts` (inventory module),
// not `/purchase/receipts`. Response shape (GoodsReceiptResponseDto) has no
// `reference`/`poNumber`/`supplierName`/`warehouseName`/`status`/aggregated
// item fields — those are joined here from the PO and warehouse lists,
// mirroring the join pattern used for PurchaseOrder.supplierName.

type BackendGoodsReceiptItem = {
  id: string
  goodsReceiptId: string
  purchaseOrderItemId: string
  productVariantId: string
  receivedQuantity: number
  rejectedQuantity: number
}

type BackendGoodsReceipt = {
  id: string
  receiptNumber: string
  purchaseOrderId: string
  warehouseId: string
  supplierId: string
  companyId: string
  receiptDate: string
  notes: string | null
  receivedBy: string
  createdAt: string
  updatedAt: string
  items?: BackendGoodsReceiptItem[]
}

function mapBackendToGoodsReceipt(
  br: BackendGoodsReceipt,
  purchaseOrders: Array<{ id: string; poNumber: string; supplierId: string; supplierName: string; items: Array<{ id: string; productId: string; productName: string; sku: string; color?: string; size?: string; quantity: number }> }>,
  warehouses: Array<{ id: string; name: string }>,
): GoodsReceipt {
  const po = purchaseOrders.find((p) => p.id === br.purchaseOrderId)
  return {
    id: br.id,
    reference: br.receiptNumber,
    purchaseOrderId: br.purchaseOrderId,
    poNumber: po?.poNumber ?? "",
    supplierId: br.supplierId,
    supplierName: po?.supplierName ?? "",
    warehouseId: br.warehouseId,
    warehouseName: warehouses.find((w) => w.id === br.warehouseId)?.name ?? "",
    // Goods receipts are immutable once created (no PATCH/DELETE) — every
    // receipt that exists on the backend is, by definition, confirmed.
    status: "confirmed",
    items: (br.items ?? []).map((it) => {
      const poLine = po?.items.find((l) => l.id === it.purchaseOrderItemId)
      return {
        id: it.id,
        productId: it.productVariantId,
        productName: poLine?.productName ?? "",
        sku: poLine?.sku ?? "",
        color: poLine?.color,
        size: poLine?.size,
        orderedQty: poLine?.quantity ?? 0,
        receivedQty: it.receivedQuantity,
        rejectedQty: it.rejectedQuantity,
      }
    }),
    receivedBy: br.receivedBy,
    receivedAt: br.receiptDate,
  }
}

export async function fetchGoodsReceipts(): Promise<GoodsReceipt[]> {
  if (USE_MOCK) return delay(mockGoodsReceipts)
  const companyId = await resolveCompanyId()
  const [grRes, purchaseOrders, warehouses] = await Promise.all([
    apiClient.get<{ data: BackendGoodsReceipt[]; meta: unknown }>("/goods-receipts", { params: { companyId } }),
    fetchPurchaseOrders(),
    fetchWarehouses(),
  ])
  return (grRes.data.data ?? []).map((br) => mapBackendToGoodsReceipt(br, purchaseOrders, warehouses))
}

export async function createGoodsReceipt(values: GoodsReceiptFormValues): Promise<GoodsReceipt> {
  if (USE_MOCK) {
    const po = mockPurchaseOrders.find((o) => o.id === values.purchaseOrderId)
    const { mockWarehouses } = await import("@/features/inventory/api/mock-data")
    const warehouse = mockWarehouses.find((w) => w.id === values.warehouseId)
    return delay({
      id: `grn-${Date.now()}`,
      reference: `GRN-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      purchaseOrderId: values.purchaseOrderId,
      poNumber: po?.poNumber ?? "",
      supplierId: po?.supplierId ?? "",
      supplierName: po?.supplierName ?? "",
      warehouseId: values.warehouseId,
      warehouseName: warehouse?.name ?? "",
      status: "confirmed",
      items: values.items.map((item, index) => ({ id: `gri-${Date.now()}-${index}`, ...item })),
      receivedBy: "You",
      receivedAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendGoodsReceipt>("/goods-receipts", {
    companyId,
    purchaseOrderId: values.purchaseOrderId,
    warehouseId: values.warehouseId,
    items: values.items.map((item) => ({
      purchaseOrderItemId: item.purchaseOrderItemId,
      productVariantId: item.productId,
      receivedQuantity: item.receivedQty,
      rejectedQuantity: item.rejectedQty,
    })),
  })
  const [purchaseOrders, warehouses] = await Promise.all([fetchPurchaseOrders(), fetchWarehouses()])
  return mapBackendToGoodsReceipt(data, purchaseOrders, warehouses)
}
