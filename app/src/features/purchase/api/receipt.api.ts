import { apiClient } from "@/lib/api/client"
import type { GoodsReceipt } from "../types"
import type { GoodsReceiptFormValues } from "../schemas/receipt.schema"
import { mockGoodsReceipts, mockPurchaseOrders } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchGoodsReceipts(): Promise<GoodsReceipt[]> {
  if (USE_MOCK) return delay(mockGoodsReceipts)
  const { data } = await apiClient.get<GoodsReceipt[]>("/purchase/receipts")
  return data
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
  const { data } = await apiClient.post<GoodsReceipt>("/purchase/receipts", values)
  return data
}
