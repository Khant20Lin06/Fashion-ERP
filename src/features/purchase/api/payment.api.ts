import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { resolveCompanyCurrency } from "@/lib/api/resolve-company-currency"
import type { PaymentMethodOption, PurchaseInvoice, PurchaseReturn, SupplierPayment } from "../types"
import type { PaymentFormValues, PurchaseReturnFormValues } from "../schemas/payment.schema"
import { mockInvoices, mockPayments, mockReturns, mockSuppliers } from "./mock-data"
import { fetchPurchaseOrders } from "./purchase-order.api"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Invoices ---
// No backend concept of a "Purchase Invoice" exists — Purchase is tracked
// as PurchaseOrder -> GoodsReceipt -> Payment(direction=PAYMENT) directly,
// with no separate invoice entity or `/purchase/invoices` route anywhere
// in the API (confirmed against every controller in
// src/modules/purchase and src/modules/payments). Genuine BACKEND GAP —
// mock-only until/unless such a concept is added server-side.

export async function fetchInvoices(): Promise<PurchaseInvoice[]> {
  if (USE_MOCK) return delay(mockInvoices)
  return []
}

// --- Payment Methods ---

type BackendPaymentMethod = {
  id: string
  companyId: string
  code: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

export async function fetchPaymentMethods(): Promise<PaymentMethodOption[]> {
  if (USE_MOCK) {
    return delay([
      { id: "pm-bank-transfer", name: "Bank Transfer" },
      { id: "pm-cash", name: "Cash" },
    ])
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendPaymentMethod[]; meta: unknown }>("/payment-methods", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map((m) => ({ id: m.id, name: m.name }))
}

// --- Payments ---
// Real route is the top-level `/payments` (generic Payment entity, not
// purchase-specific), filtered to direction=PAYMENT (company -> supplier).
// CreatePaymentDto has no `invoiceId`/`method` — it takes `paymentMethodId`
// (FK to PaymentMethod) and `allocations: [{referenceType, referenceId,
// allocatedAmount}]`, allocated here against the chosen PurchaseOrder.

type BackendPayment = {
  id: string
  paymentNumber: string
  companyId: string
  branchId: string | null
  direction: "RECEIPT" | "PAYMENT"
  customerId: string | null
  supplierId: string | null
  paymentMethodId: string
  amount: string
  currency: string
  reference: string | null
  status: string
  paymentDate: string
  notes: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  allocations?: Array<{ referenceType: string; referenceId: string; allocatedAmount: string }>
}

function mapBackendToSupplierPayment(
  bp: BackendPayment,
  suppliers: Array<{ id: string; name: string }>,
  purchaseOrders: Array<{ id: string; poNumber: string }>,
  paymentMethods: PaymentMethodOption[],
): SupplierPayment {
  const purchaseOrderId = bp.allocations?.find((a) => a.referenceType === "PURCHASE_ORDER")?.referenceId ?? ""
  return {
    id: bp.id,
    reference: bp.paymentNumber,
    supplierId: bp.supplierId ?? "",
    supplierName: suppliers.find((s) => s.id === bp.supplierId)?.name ?? "",
    purchaseOrderId,
    poNumber: purchaseOrders.find((p) => p.id === purchaseOrderId)?.poNumber ?? "",
    paymentMethodId: bp.paymentMethodId,
    paymentMethodName: paymentMethods.find((m) => m.id === bp.paymentMethodId)?.name ?? "",
    paymentDate: bp.paymentDate,
    amount: parseFloat(bp.amount) || 0,
    referenceNumber: bp.reference ?? undefined,
    notes: bp.notes ?? undefined,
  }
}

async function fetchSuppliersForJoin(companyId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const { data } = await apiClient.get<{ data: Array<{ id: string; name: string }>; meta: unknown }>(
      "/suppliers",
      { params: { companyId, limit: 100 } },
    )
    return data.data ?? []
  } catch {
    return []
  }
}

export async function fetchPayments(): Promise<SupplierPayment[]> {
  if (USE_MOCK) return delay(mockPayments)
  const companyId = await resolveCompanyId()
  const [payRes, suppliers, purchaseOrders, paymentMethods] = await Promise.all([
    apiClient.get<{ data: BackendPayment[]; meta: unknown }>("/payments", {
      params: { companyId, direction: "PAYMENT", limit: 100 },
    }),
    fetchSuppliersForJoin(companyId),
    fetchPurchaseOrders(),
    fetchPaymentMethods(),
  ])
  return (payRes.data.data ?? []).map((bp) =>
    mapBackendToSupplierPayment(bp, suppliers, purchaseOrders, paymentMethods),
  )
}

export async function createPayment(values: PaymentFormValues): Promise<SupplierPayment> {
  if (USE_MOCK) {
    const supplier = mockSuppliers.find((s) => s.id === values.supplierId)
    const po = (await import("./mock-data")).mockPurchaseOrders.find((o) => o.id === values.purchaseOrderId)
    return delay({
      id: `pay-${Date.now()}`,
      reference: `PMT-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      supplierId: values.supplierId,
      supplierName: supplier?.name ?? "",
      purchaseOrderId: values.purchaseOrderId,
      poNumber: po?.poNumber ?? "",
      paymentMethodId: values.paymentMethodId,
      paymentMethodName: "",
      paymentDate: values.paymentDate,
      amount: values.amount,
      referenceNumber: values.referenceNumber,
      notes: values.notes,
    })
  }
  const companyId = await resolveCompanyId()
  const currency = await resolveCompanyCurrency(companyId)
  // The real backend honors an Idempotency-Key header on POST /payments
  // (see erp-pos fashion api PaymentsController) — a retried request with
  // the same key returns the existing payment instead of creating a
  // duplicate supplier payment.
  const idempotencyKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `pay-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const { data } = await apiClient.post<BackendPayment>(
    "/payments",
    {
      companyId,
      direction: "PAYMENT",
      supplierId: values.supplierId,
      paymentMethodId: values.paymentMethodId,
      amount: values.amount.toFixed(2),
      currency,
      reference: values.referenceNumber || undefined,
      paymentDate: values.paymentDate || undefined,
      notes: values.notes || undefined,
      allocations: [
        {
          referenceType: "PURCHASE_ORDER",
          referenceId: values.purchaseOrderId,
          allocatedAmount: values.amount.toFixed(2),
        },
      ],
    },
    { headers: { "Idempotency-Key": idempotencyKey } },
  )
  const [suppliers, purchaseOrders, paymentMethods] = await Promise.all([
    fetchSuppliersForJoin(companyId),
    fetchPurchaseOrders(),
    fetchPaymentMethods(),
  ])
  return mapBackendToSupplierPayment(data, suppliers, purchaseOrders, paymentMethods)
}

// --- Returns ---
// No backend concept of a "Purchase Return" exists anywhere in the API
// (no matching controller/module/entity in src/modules) — genuine BACKEND
// GAP. Mock-only until/unless such a concept is added server-side.

export async function fetchPurchaseReturns(): Promise<PurchaseReturn[]> {
  if (USE_MOCK) return delay(mockReturns)
  return []
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
  throw new Error("Purchase returns are not available yet.")
}
