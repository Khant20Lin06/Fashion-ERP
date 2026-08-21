import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { ReturnStatus, SalesReturn, SalesReturnItemCondition } from "../types"
import type { SalesReturnFormValues } from "../schemas/sales.schema"
import { mockReturns } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real backend routes (erp-pos fashion api src/modules/sales-returns):
//   GET/POST /returns, GET /returns/:id
//   POST /returns/:id/confirm, POST /returns/:id/cancel
// permission sales_returns.read/create/confirm/cancel. CreateSaleReturnDto:
//   { companyId, saleId, reason?, notes?, items: [{ saleItemId, quantity, discountAmount? }] }
// Response has no product name/sku/color/size — those are resolved from
// the already-loaded invoice line items in ReturnForm, same as the
// invoice mapper does for sales.

type BackendSaleReturnItem = {
  id: string
  saleItemId: string
  productVariantId: string
  quantity: number
  unitPriceSnapshot: string
  discountAmount: string
  lineTotal: string
  condition: SalesReturnItemCondition
  productNameSnapshot: string
  skuSnapshot: string
}

type BackendSaleReturn = {
  id: string
  companyId: string
  branchId: string | null
  saleId: string
  saleNumber: string | null
  saleWarehouseId: string | null
  customerId: string
  customerName: string | null
  returnNumber: string
  status: "DRAFT" | "CONFIRMED" | "REFUNDED" | "CANCELLED"
  reason: string | null
  notes: string | null
  subtotal: string
  discountAmount: string
  refundAmount: string
  refundedAmount: string
  currency: string
  createdAt: string
  updatedAt: string
  items?: BackendSaleReturnItem[]
}

function mapStatus(status: BackendSaleReturn["status"]): ReturnStatus {
  if (status === "REFUNDED") return "refunded"
  if (status === "CONFIRMED") return "confirmed"
  if (status === "CANCELLED") return "cancelled"
  return "draft"
}

function mapBackendSaleReturn(r: BackendSaleReturn): SalesReturn {
  return {
    id: r.id,
    returnNumber: r.returnNumber,
    saleId: r.saleId,
    invoiceNumber: r.saleNumber ?? r.saleId,
    saleWarehouseId: r.saleWarehouseId ?? null,
    customerId: r.customerId,
    customerName: r.customerName ?? "Walk-in Customer",
    reason: r.reason ?? "",
    status: mapStatus(r.status),
    items: (r.items ?? []).map((item) => ({
      id: item.id,
      saleItemId: item.saleItemId,
      productId: item.productVariantId,
      productName: item.productNameSnapshot || item.productVariantId,
      sku: item.skuSnapshot || item.productVariantId,
      purchasedQty: item.quantity,
      returnQty: item.quantity,
      unitPrice: Number(item.unitPriceSnapshot || 0),
      discountAmount: Number(item.discountAmount || 0),
      lineTotal: Number(item.lineTotal || 0),
      condition: item.condition,
    })),
    refundAmount: Number(r.refundAmount || 0),
    refundedAmount: Number(r.refundedAmount || 0),
    notes: r.notes ?? undefined,
    createdAt: r.createdAt,
  }
}

export async function fetchSalesReturns(): Promise<SalesReturn[]> {
  if (USE_MOCK) return delay(mockReturns)
  const companyId = await resolveCompanyId()
  const pageSize = 100
  const returns: BackendSaleReturn[] = []
  let page = 1
  let total = 0

  do {
    const { data } = await apiClient.get<{ data: BackendSaleReturn[]; meta?: { total?: number } }>("/returns", {
      params: { companyId, page, limit: pageSize },
    })

    const batch = data.data ?? []
    returns.push(...batch)
    total = data.meta?.total ?? batch.length
    page += 1

    if (batch.length < pageSize) break
  } while (returns.length < total)

  return returns.map((r) => mapBackendSaleReturn(r))
}

export async function createSalesReturn(values: SalesReturnFormValues): Promise<SalesReturn> {
  if (USE_MOCK) {
    const refundAmount = values.items.reduce((sum, item) => sum + item.returnQty * item.unitPrice, 0)
    return delay({
      id: `sret-${Date.now()}`,
      returnNumber: `RTN-S-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      saleId: values.invoiceId,
      invoiceNumber: "SINV-2026-TEMP",
      customerId: "CUST-TEMP",
      customerName: "Walk-in Customer",
      reason: values.reason,
      status: "draft",
      items: values.items.map((item, index) => ({ id: `sreti-${Date.now()}-${index}`, ...item })),
      refundAmount,
      refundedAmount: 0,
      notes: values.notes,
      createdAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendSaleReturn>("/returns", {
    companyId,
    saleId: values.invoiceId,
    reason: values.reason,
    notes: values.notes,
    items: values.items.map((item) => ({
      saleItemId: item.saleItemId,
      quantity: item.returnQty,
      condition: item.condition,
    })),
  })
  return mapBackendSaleReturn(data)
}

// Only DRAFT -> CONFIRMED and DRAFT -> CANCELLED are supported by the
// backend (POST /returns/:id/confirm, POST /returns/:id/cancel) — there is
// no generic status PATCH and no "approved"/"processed"/"rejected" state.
export async function updateSalesReturnStatus(id: string, status: ReturnStatus): Promise<SalesReturn> {
  if (USE_MOCK) {
    const existing = mockReturns.find((r) => r.id === id)
    if (existing) return delay({ ...existing, status })
    throw new Error("Sales return not found")
  }
  const companyId = await resolveCompanyId()
  if (status === "confirmed") {
    const { data } = await apiClient.post<BackendSaleReturn>(`/returns/${id}/confirm`, null, { params: { companyId } })
    return mapBackendSaleReturn(data)
  }
  if (status === "cancelled") {
    const { data } = await apiClient.post<BackendSaleReturn>(`/returns/${id}/cancel`, null, { params: { companyId } })
    return mapBackendSaleReturn(data)
  }
  throw new Error(`Unsupported sales return status transition: ${status}`)
}
