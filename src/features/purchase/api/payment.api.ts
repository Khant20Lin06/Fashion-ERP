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

type BackendPurchaseInvoiceStatus = "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE"
type BackendPurchaseInvoiceLifecycleStatus = "DRAFT" | "POSTED" | "VOIDED"

type BackendPurchaseInvoice = {
  id: string
  invoiceNumber: string
  supplierId: string
  purchaseOrderId: string
  goodsReceiptIds: string[]
  companyId: string
  invoiceDate: string
  dueDate: string
  status: BackendPurchaseInvoiceLifecycleStatus
  subtotal: string
  discountAmount: string
  taxAmount: string
  grandTotal: string
  amountPaid: string
  creditedAmount: string
  balanceAmount: string
  currency: string
  paymentStatus: BackendPurchaseInvoiceStatus
}

function mapBackendInvoiceStatus(status: BackendPurchaseInvoiceStatus): PurchaseInvoice["paymentStatus"] {
  switch (status) {
    case "PAID":
      return "paid"
    case "PARTIAL":
      return "partial"
    case "OVERDUE":
      return "overdue"
    default:
      return "unpaid"
  }
}

function mapBackendToPurchaseInvoice(
  invoice: BackendPurchaseInvoice,
  purchaseOrders: Array<{ id: string; poNumber: string; supplierName: string }>,
): PurchaseInvoice {
  const purchaseOrder = purchaseOrders.find((order) => order.id === invoice.purchaseOrderId)
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    supplierId: invoice.supplierId,
    supplierName: purchaseOrder?.supplierName ?? "",
    purchaseOrderId: invoice.purchaseOrderId,
    poNumber: purchaseOrder?.poNumber ?? "",
    subtotal: parseFloat(invoice.subtotal) || 0,
    taxTotal: parseFloat(invoice.taxAmount) || 0,
    discountTotal: parseFloat(invoice.discountAmount) || 0,
    grandTotal: parseFloat(invoice.grandTotal) || 0,
    amountPaid: parseFloat(invoice.amountPaid) || 0,
    creditedAmount: parseFloat(invoice.creditedAmount) || 0,
    balanceAmount: parseFloat(invoice.balanceAmount) || 0,
    status:
      invoice.status === "POSTED" ? "posted" : invoice.status === "VOIDED" ? "voided" : "draft",
    paymentStatus: mapBackendInvoiceStatus(invoice.paymentStatus),
    dueDate: invoice.dueDate,
    issuedAt: invoice.invoiceDate,
    goodsReceiptIds: invoice.goodsReceiptIds ?? [],
    currency: invoice.currency,
  }
}

export async function fetchInvoices(): Promise<PurchaseInvoice[]> {
  if (USE_MOCK) return delay(mockInvoices)
  const companyId = await resolveCompanyId()
  const [invoices, purchaseOrders] = await Promise.all([
    fetchAllPages<BackendPurchaseInvoice>("/purchase-invoices", {
      companyId,
    }),
    fetchPurchaseOrders(),
  ])
  return invoices.map((invoice) => mapBackendToPurchaseInvoice(invoice, purchaseOrders))
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
  return (data.data ?? []).map((method) => ({ id: method.id, name: method.name }))
}

// --- Payments ---
// Backend payments are still stored in the generic `/payments` module.
// Supplier AP now allocates against the persisted Purchase Invoice itself.

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

type BackendPurchaseReturnStatus = "DRAFT" | "COMPLETED" | "CANCELLED"

type BackendPurchaseReturnItem = {
  id: string
  purchaseOrderItemId: string
  productVariantId: string
  quantity: number
  unitCostSnapshot: string
  lineTotal: string
  productNameSnapshot: string
  skuSnapshot: string
}

type BackendPurchaseReturn = {
  id: string
  companyId: string
  branchId: string | null
  supplierId: string
  supplierName: string | null
  purchaseOrderId: string
  purchaseOrderNumber: string | null
  purchaseInvoiceId: string
  purchaseInvoiceNumber: string | null
  returnNumber: string
  status: BackendPurchaseReturnStatus
  reason: string
  notes: string | null
  subtotal: string
  creditAppliedAmount: string
  supplierCreditAmount: string
  currency: string
  createdBy: string | null
  completedBy: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  items?: BackendPurchaseReturnItem[]
}

type PaginatedResponse<T> = {
  data?: T[]
  meta?: {
    page?: number
    limit?: number
    total?: number
  } | null
}

async function fetchAllPages<T>(path: string, params: Record<string, string | number | undefined>): Promise<T[]> {
  const limit = 100
  let page = 1
  let total = Number.POSITIVE_INFINITY
  const rows: T[] = []

  while (rows.length < total) {
    const { data } = await apiClient.get<PaginatedResponse<T>>(path, {
      params: { ...params, page, limit },
    })
    const batch = data.data ?? []
    rows.push(...batch)

    const reportedTotal = data.meta?.total
    total = typeof reportedTotal === "number" ? reportedTotal : batch.length < limit ? rows.length : rows.length + limit
    if (batch.length < limit) break
    page += 1
  }

  return rows
}

function mapBackendToSupplierPayment(
  payment: BackendPayment,
  suppliers: Array<{ id: string; name: string }>,
  invoices: PurchaseInvoice[],
  paymentMethods: PaymentMethodOption[],
): SupplierPayment {
  const invoiceAllocationId =
    payment.allocations?.find((allocation) => allocation.referenceType === "PURCHASE_INVOICE")?.referenceId ?? ""
  const purchaseOrderAllocationId =
    payment.allocations?.find((allocation) => allocation.referenceType === "PURCHASE_ORDER")?.referenceId ?? ""
  const invoice =
    invoices.find((entry) => entry.id === invoiceAllocationId) ??
    invoices.find((entry) => entry.purchaseOrderId === purchaseOrderAllocationId)

  return {
    id: payment.id,
    reference: payment.paymentNumber,
    supplierId: payment.supplierId ?? "",
    supplierName: suppliers.find((supplier) => supplier.id === payment.supplierId)?.name ?? "",
    purchaseInvoiceId: invoice?.id ?? "",
    invoiceNumber: invoice?.invoiceNumber ?? "",
    purchaseOrderId: invoice?.purchaseOrderId ?? purchaseOrderAllocationId,
    poNumber: invoice?.poNumber ?? "",
    paymentMethodId: payment.paymentMethodId,
    paymentMethodName: paymentMethods.find((method) => method.id === payment.paymentMethodId)?.name ?? "",
    paymentDate: payment.paymentDate,
    amount: parseFloat(payment.amount) || 0,
    referenceNumber: payment.reference ?? undefined,
    notes: payment.notes ?? undefined,
  }
}

async function fetchSuppliersForJoin(companyId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    return await fetchAllPages<{ id: string; name: string }>("/suppliers", {
      companyId,
    })
  } catch {
    return []
  }
}

export async function fetchPayments(): Promise<SupplierPayment[]> {
  if (USE_MOCK) return delay(mockPayments)
  const companyId = await resolveCompanyId()
  const [payments, suppliers, invoices, paymentMethods] = await Promise.all([
    fetchAllPages<BackendPayment>("/payments", {
      companyId,
      direction: "PAYMENT",
    }),
    fetchSuppliersForJoin(companyId),
    fetchInvoices(),
    fetchPaymentMethods(),
  ])
  return payments.map((payment) => mapBackendToSupplierPayment(payment, suppliers, invoices, paymentMethods))
}

export async function createPayment(values: PaymentFormValues): Promise<SupplierPayment> {
  if (USE_MOCK) {
    const supplier = mockSuppliers.find((entry) => entry.id === values.supplierId)
    const invoice = mockInvoices.find((entry) => entry.id === values.purchaseInvoiceId)
    return delay({
      id: `pay-${Date.now()}`,
      reference: `PMT-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      supplierId: values.supplierId,
      supplierName: supplier?.name ?? "",
      purchaseInvoiceId: values.purchaseInvoiceId,
      invoiceNumber: invoice?.invoiceNumber ?? "",
      purchaseOrderId: invoice?.purchaseOrderId ?? "",
      poNumber: invoice?.poNumber ?? "",
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
  const invoices = await fetchInvoices()
  const selectedInvoice = invoices.find((invoice) => invoice.id === values.purchaseInvoiceId)
  if (!selectedInvoice) {
    throw new Error("Purchase invoice not found")
  }
  if (values.amount > selectedInvoice.balanceAmount) {
    throw new Error("Payment amount cannot exceed the outstanding balance")
  }

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
          referenceType: "PURCHASE_INVOICE",
          referenceId: selectedInvoice.id,
          allocatedAmount: values.amount.toFixed(2),
        },
      ],
    },
    { headers: { "Idempotency-Key": idempotencyKey } },
  )

  const [suppliers, paymentMethods] = await Promise.all([
    fetchSuppliersForJoin(companyId),
    fetchPaymentMethods(),
  ])
  return mapBackendToSupplierPayment(data, suppliers, invoices, paymentMethods)
}

// --- Returns ---

function mapReturnStatus(status: BackendPurchaseReturnStatus): PurchaseReturn["status"] {
  switch (status) {
    case "COMPLETED":
      return "completed"
    case "CANCELLED":
      return "cancelled"
    default:
      return "draft"
  }
}

function mapBackendToPurchaseReturn(entry: BackendPurchaseReturn): PurchaseReturn {
  return {
    id: entry.id,
    reference: entry.returnNumber,
    supplierId: entry.supplierId,
    supplierName: entry.supplierName ?? "",
    purchaseOrderId: entry.purchaseOrderId,
    poNumber: entry.purchaseOrderNumber ?? "",
    purchaseInvoiceId: entry.purchaseInvoiceId,
    invoiceNumber: entry.purchaseInvoiceNumber ?? "",
    reason: entry.reason as PurchaseReturn["reason"],
    status: mapReturnStatus(entry.status),
    items: (entry.items ?? []).map((item) => ({
      id: item.id,
      purchaseOrderItemId: item.purchaseOrderItemId,
      productId: item.productVariantId,
      productName: item.productNameSnapshot,
      sku: item.skuSnapshot,
      quantity: item.quantity,
      unitCost: parseFloat(item.unitCostSnapshot) || 0,
      lineTotal: parseFloat(item.lineTotal) || 0,
    })),
    creditAppliedAmount: parseFloat(entry.creditAppliedAmount) || 0,
    supplierCreditAmount: parseFloat(entry.supplierCreditAmount) || 0,
    notes: entry.notes ?? undefined,
    createdAt: entry.createdAt,
    completedAt: entry.completedAt ?? undefined,
  }
}

export async function fetchPurchaseReturns(): Promise<PurchaseReturn[]> {
  if (USE_MOCK) return delay(mockReturns)
  const companyId = await resolveCompanyId()
  const rows = await fetchAllPages<BackendPurchaseReturn>("/purchase-returns", { companyId })
  return rows.map(mapBackendToPurchaseReturn)
}

export async function createPurchaseReturn(values: PurchaseReturnFormValues): Promise<PurchaseReturn> {
  if (USE_MOCK) {
    const supplier = mockSuppliers.find((entry) => entry.id === values.supplierId)
    const invoice = mockInvoices.find((entry) => entry.id === values.purchaseInvoiceId)
    const purchaseOrder = invoice
      ? (await import("./mock-data")).mockPurchaseOrders.find((entry) => entry.id === invoice.purchaseOrderId)
      : undefined
    return delay({
      id: `ret-${Date.now()}`,
      reference: `RTN-P-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      supplierId: values.supplierId,
      supplierName: supplier?.name ?? "",
      purchaseOrderId: purchaseOrder?.id ?? "",
      poNumber: purchaseOrder?.poNumber ?? "",
      purchaseInvoiceId: values.purchaseInvoiceId,
      invoiceNumber: invoice?.invoiceNumber ?? "",
      reason: values.reason,
      status: "draft",
      items: values.items.map((item, index) => ({
        id: `reti-${Date.now()}-${index}`,
        purchaseOrderItemId: item.purchaseOrderItemId,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitCost: item.unitCost,
        lineTotal: item.quantity * item.unitCost,
      })),
      creditAppliedAmount: 0,
      supplierCreditAmount: 0,
      notes: values.notes,
      createdAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPurchaseReturn>("/purchase-returns", {
    companyId,
    supplierId: values.supplierId,
    purchaseInvoiceId: values.purchaseInvoiceId,
    reason: values.reason,
    notes: values.notes || undefined,
    items: values.items.map((item) => ({
      purchaseOrderItemId: item.purchaseOrderItemId,
      quantity: item.quantity,
    })),
  })
  return mapBackendToPurchaseReturn(data)
}

export async function completePurchaseReturn(id: string): Promise<PurchaseReturn> {
  if (USE_MOCK) {
    const existing = mockReturns.find((entry) => entry.id === id)
    if (!existing) throw new Error("Purchase return not found")
    return delay({ ...existing, status: "completed" })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPurchaseReturn>(`/purchase-returns/${id}/complete`, undefined, {
    params: { companyId },
  })
  return mapBackendToPurchaseReturn(data)
}

export async function cancelPurchaseReturn(id: string): Promise<PurchaseReturn> {
  if (USE_MOCK) {
    const existing = mockReturns.find((entry) => entry.id === id)
    if (!existing) throw new Error("Purchase return not found")
    return delay({ ...existing, status: "cancelled" })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPurchaseReturn>(`/purchase-returns/${id}/cancel`, undefined, {
    params: { companyId },
  })
  return mapBackendToPurchaseReturn(data)
}
