import { apiClient } from "@/lib/api/client"
import type { PurchaseInvoice, PurchaseReturn, SupplierPayment } from "../types"
import type { PaymentFormValues, PurchaseReturnFormValues } from "../schemas/payment.schema"
import { mockInvoices, mockPayments, mockReturns, mockSuppliers } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Invoices ---

export async function fetchInvoices(): Promise<PurchaseInvoice[]> {
  if (USE_MOCK) return delay(mockInvoices)
  const { data } = await apiClient.get<PurchaseInvoice[]>("/purchase/invoices")
  return data
}

// --- Payments ---

export async function fetchPayments(): Promise<SupplierPayment[]> {
  if (USE_MOCK) return delay(mockPayments)
  const { data } = await apiClient.get<SupplierPayment[]>("/purchase/payments")
  return data
}

export async function createPayment(values: PaymentFormValues): Promise<SupplierPayment> {
  if (USE_MOCK) {
    const supplier = mockSuppliers.find((s) => s.id === values.supplierId)
    const invoice = mockInvoices.find((i) => i.id === values.invoiceId)
    return delay({
      id: `pay-${Date.now()}`,
      reference: `PMT-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      supplierId: values.supplierId,
      supplierName: supplier?.name ?? "",
      invoiceId: values.invoiceId,
      invoiceNumber: invoice?.invoiceNumber ?? "",
      paymentDate: values.paymentDate,
      amount: values.amount,
      method: values.method,
      referenceNumber: values.referenceNumber,
      notes: values.notes,
    })
  }
  const { data } = await apiClient.post<SupplierPayment>("/purchase/payments", values)
  return data
}

// --- Returns ---

export async function fetchPurchaseReturns(): Promise<PurchaseReturn[]> {
  if (USE_MOCK) return delay(mockReturns)
  const { data } = await apiClient.get<PurchaseReturn[]>("/purchase/returns")
  return data
}

export async function createPurchaseReturn(values: PurchaseReturnFormValues): Promise<PurchaseReturn> {
  if (USE_MOCK) {
    const supplier = mockSuppliers.find((s) => s.id === values.supplierId)
    const po = values.purchaseOrderId
      ? (await import("./mock-data")).mockPurchaseOrders.find((o) => o.id === values.purchaseOrderId)
      : undefined
    return delay({
      id: `ret-${Date.now()}`,
      reference: `RTN-P-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      supplierId: values.supplierId,
      supplierName: supplier?.name ?? "",
      purchaseOrderId: values.purchaseOrderId,
      poNumber: po?.poNumber,
      reason: values.reason,
      status: "draft",
      items: values.items.map((item, index) => ({ id: `reti-${Date.now()}-${index}`, ...item })),
      notes: values.notes,
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<PurchaseReturn>("/purchase/returns", values)
  return data
}
