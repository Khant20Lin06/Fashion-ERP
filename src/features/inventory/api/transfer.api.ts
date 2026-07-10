import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { StockTransfer, TransferStatus } from "../types"
import type { TransferFormValues } from "../schemas/transfer.schema"
import { mockTransfers } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchTransfers(): Promise<StockTransfer[]> {
  if (USE_MOCK) return delay(mockTransfers)
  const { data } = await apiClient.get<StockTransfer[]>("/inventory/transfers")
  return data
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
      status: "draft",
      items: values.items.map((item, index) => ({ id: `line-${Date.now()}-${index}`, ...item })),
      createdBy: "You",
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<StockTransfer>("/inventory/transfers", values)
  return data
}

export async function updateTransferStatus(id: string, status: TransferStatus): Promise<StockTransfer> {
  if (USE_MOCK) {
    const existing = mockTransfers.find((t) => t.id === id)
    if (!existing) throw new Error("Transfer not found")
    return delay({
      ...existing,
      status,
      approvedBy: status === "approved" ? "Manager" : existing.approvedBy,
      approvedAt: status === "approved" ? new Date().toISOString() : existing.approvedAt,
    })
  }
  const { data } = await apiClient.patch<StockTransfer>(`/inventory/transfers/${id}/status`, { status })
  return data
}
