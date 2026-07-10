import { apiClient } from "@/lib/api/client"
import type { ReturnStatus, SalesReturn } from "../types"
import type { SalesReturnFormValues } from "../schemas/sales.schema"
import { mockInvoices, mockReturns } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchSalesReturns(): Promise<SalesReturn[]> {
  if (USE_MOCK) return delay(mockReturns)
  const { data } = await apiClient.get<SalesReturn[]>("/sales/returns")
  return data
}

export async function createSalesReturn(values: SalesReturnFormValues): Promise<SalesReturn> {
  if (USE_MOCK) {
    const invoice = mockInvoices.find((i) => i.id === values.invoiceId)
    const refundAmount = values.items.reduce((sum, item) => sum + item.returnQty * item.unitPrice, 0)
    return delay({
      id: `sret-${Date.now()}`,
      reference: `RTN-S-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      invoiceId: values.invoiceId,
      invoiceNumber: invoice?.invoiceNumber ?? "",
      customerId: invoice?.customerId ?? "",
      customerName: invoice?.customerName ?? "",
      type: values.type,
      reason: values.reason,
      refundMethod: values.refundMethod,
      status: "requested",
      items: values.items.map((item, index) => ({ id: `sreti-${Date.now()}-${index}`, ...item })),
      refundAmount,
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<SalesReturn>("/sales/returns", values)
  return data
}

export async function updateSalesReturnStatus(id: string, status: ReturnStatus): Promise<SalesReturn> {
  if (USE_MOCK) {
    const existing = mockReturns.find((r) => r.id === id)
    if (!existing) throw new Error("Return not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<SalesReturn>(`/sales/returns/${id}/status`, { status })
  return data
}
