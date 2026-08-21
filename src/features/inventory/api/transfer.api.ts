import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { StockTransfer } from "../types"
import type { TransferFormValues } from "../schemas/transfer.schema"
import { mockTransfers } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real route is @Controller('stock-transfers'), not /inventory/transfers,
// and StockTransfer (Phase 14 D9/D22, LOCKED) has no status field — no
// PATCH exists at all, creation is the whole lifecycle.

type BackendStockTransferItem = {
  id: string
  stockTransferId: string
  productVariantId: string
  quantity: number
  productName: string | null
  sku: string | null
  variantLabel: string | null
}

type BackendStockTransfer = {
  id: string
  transferNumber: string
  sourceWarehouseId: string
  sourceWarehouseName: string | null
  destinationWarehouseId: string
  destinationWarehouseName: string | null
  companyId: string
  notes: string | null
  createdBy: string
  createdByName: string | null
  createdAt: string
  updatedAt: string
  items: BackendStockTransferItem[]
}

function mapBackendToTransfer(bt: BackendStockTransfer): StockTransfer {
  return {
    id: bt.id,
    reference: bt.transferNumber,
    fromWarehouseId: bt.sourceWarehouseId,
    fromWarehouseName: bt.sourceWarehouseName ?? "",
    toWarehouseId: bt.destinationWarehouseId,
    toWarehouseName: bt.destinationWarehouseName ?? "",
    items: bt.items.map((it) => ({
      id: it.id,
      productId: it.productVariantId,
      productName: it.productName ?? "",
      sku: it.sku ?? "",
      variantLabel: it.variantLabel ?? undefined,
      transferQty: it.quantity,
    })),
    notes: bt.notes ?? undefined,
    createdBy: bt.createdByName ?? bt.createdBy,
    createdAt: bt.createdAt,
  }
}

export async function fetchTransfers(): Promise<StockTransfer[]> {
  if (USE_MOCK) return delay(mockTransfers)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendStockTransfer[]; meta: unknown }>("/stock-transfers", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapBackendToTransfer)
}

export async function createTransfer(values: TransferFormValues): Promise<StockTransfer> {
  if (USE_MOCK) {
    const fromWarehouse = (await import("./mock-data")).mockWarehouses.find((w) => w.id === values.fromWarehouseId)
    const toWarehouse = (await import("./mock-data")).mockWarehouses.find((w) => w.id === values.toWarehouseId)
    return delay({
      id: `trf-${Date.now()}`,
      reference: `TRF-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      fromWarehouseId: values.fromWarehouseId,
      fromWarehouseName: fromWarehouse?.name ?? "",
      toWarehouseId: values.toWarehouseId,
      toWarehouseName: toWarehouse?.name ?? "",
      items: values.items.map((item, index) => ({ id: `line-${Date.now()}-${index}`, ...item })),
      notes: values.notes || undefined,
      createdBy: "You",
      createdAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendStockTransfer>("/stock-transfers", {
    companyId,
    sourceWarehouseId: values.fromWarehouseId,
    destinationWarehouseId: values.toWarehouseId,
    notes: values.notes?.trim() || undefined,
    items: values.items.map((item) => ({
      productVariantId: item.productId,
      quantity: item.transferQty,
    })),
  })
  return mapBackendToTransfer(data)
}
