import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { resolveCompanyCurrency } from "@/lib/api/resolve-company-currency"
import { env } from "@/config/env"
import type {
  RequestForQuotation,
  RequestForQuotationStatus,
  SupplierQuotation,
  SupplierQuotationStatus,
} from "../types"
import type {
  PurchaseRfqFormValues,
  SupplierQuotationFormValues,
} from "../schemas/procurement.schema"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
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

type BackendRfqStatus = "DRAFT" | "SENT" | "CLOSED" | "CANCELLED"
type BackendSupplierQuotationStatus = "SUBMITTED" | "AWARDED" | "REJECTED"

type BackendRfqItem = {
  id: string
  purchaseRfqId: string
  productVariantId: string
  quantity: number
  reasonSnapshot: string
  productNameSnapshot: string
  skuSnapshot: string
}

type BackendRfq = {
  id: string
  rfqNumber: string
  purchaseRequestId: string | null
  title: string
  requiredDate: string
  status: BackendRfqStatus
  invitedSupplierIds: string[]
  notes: string | null
  createdAt: string
  items?: BackendRfqItem[]
}

type BackendSupplierQuotationItem = {
  id: string
  supplierQuotationId: string
  purchaseRfqItemId: string
  productVariantId: string
  quantity: number
  unitCostSnapshot: string
  discountSnapshot: string
  taxSnapshot: string
  lineTotal: string
  productNameSnapshot: string
  skuSnapshot: string
}

type BackendSupplierQuotation = {
  id: string
  quotationNumber: string
  purchaseRfqId: string
  supplierId: string
  paymentTermId: string | null
  leadTimeDays: number | null
  status: BackendSupplierQuotationStatus
  subtotal: string
  discountAmount: string
  taxAmount: string
  grandTotal: string
  currency: string
  notes: string | null
  createdAt: string
  items?: BackendSupplierQuotationItem[]
  purchaseRfq?: {
    id: string
    rfqNumber: string
    title: string
    requiredDate: string
    purchaseRequestId: string | null
  }
}

function mapRfqStatusFromBackend(status: BackendRfqStatus): RequestForQuotationStatus {
  switch (status) {
    case "SENT":
      return "sent"
    case "CLOSED":
      return "closed"
    case "CANCELLED":
      return "cancelled"
    default:
      return "draft"
  }
}

function mapRfqStatusToBackend(status: RequestForQuotationStatus): BackendRfqStatus {
  switch (status) {
    case "sent":
      return "SENT"
    case "closed":
      return "CLOSED"
    case "cancelled":
      return "CANCELLED"
    default:
      return "DRAFT"
  }
}

function mapQuotationStatusFromBackend(status: BackendSupplierQuotationStatus): SupplierQuotationStatus {
  switch (status) {
    case "AWARDED":
      return "awarded"
    case "REJECTED":
      return "rejected"
    default:
      return "submitted"
  }
}

function mapQuotationStatusToBackend(status: SupplierQuotationStatus): BackendSupplierQuotationStatus {
  switch (status) {
    case "awarded":
      return "AWARDED"
    case "rejected":
      return "REJECTED"
    default:
      return "SUBMITTED"
  }
}

function mapBackendRfq(row: BackendRfq): RequestForQuotation {
  return {
    id: row.id,
    rfqNumber: row.rfqNumber,
    purchaseRequestId: row.purchaseRequestId,
    title: row.title,
    requiredDate: row.requiredDate,
    status: mapRfqStatusFromBackend(row.status),
    invitedSupplierIds: row.invitedSupplierIds ?? [],
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      purchaseRfqId: item.purchaseRfqId,
      productId: item.productVariantId,
      productName: item.productNameSnapshot,
      sku: item.skuSnapshot,
      quantity: item.quantity,
      reason: item.reasonSnapshot,
    })),
  }
}

function mapBackendQuotation(row: BackendSupplierQuotation): SupplierQuotation {
  return {
    id: row.id,
    quotationNumber: row.quotationNumber,
    purchaseRfqId: row.purchaseRfqId,
    supplierId: row.supplierId,
    paymentTermId: row.paymentTermId,
    leadTimeDays: row.leadTimeDays,
    status: mapQuotationStatusFromBackend(row.status),
    subtotal: parseFloat(row.subtotal) || 0,
    discountTotal: parseFloat(row.discountAmount) || 0,
    taxTotal: parseFloat(row.taxAmount) || 0,
    grandTotal: parseFloat(row.grandTotal) || 0,
    currency: row.currency,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    rfq: row.purchaseRfq
      ? {
          id: row.purchaseRfq.id,
          rfqNumber: row.purchaseRfq.rfqNumber,
          title: row.purchaseRfq.title,
          requiredDate: row.purchaseRfq.requiredDate,
          purchaseRequestId: row.purchaseRfq.purchaseRequestId,
        }
      : undefined,
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      supplierQuotationId: item.supplierQuotationId,
      purchaseRfqItemId: item.purchaseRfqItemId,
      productId: item.productVariantId,
      productName: item.productNameSnapshot,
      sku: item.skuSnapshot,
      quantity: item.quantity,
      unitCost: parseFloat(item.unitCostSnapshot) || 0,
      discount: parseFloat(item.discountSnapshot) || 0,
      tax: parseFloat(item.taxSnapshot) || 0,
      amount: parseFloat(item.lineTotal) || 0,
    })),
  }
}

export async function fetchPurchaseRfqs(): Promise<RequestForQuotation[]> {
  if (USE_MOCK) return delay([])
  const companyId = await resolveCompanyId()
  const rows = await fetchAllPages<BackendRfq>("/purchase-rfqs", { companyId })
  return rows.map(mapBackendRfq)
}

export async function fetchPurchaseRfqById(id: string): Promise<RequestForQuotation | undefined> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  try {
    const { data } = await apiClient.get<BackendRfq>(`/purchase-rfqs/${id}`, {
      params: { companyId },
    })
    return mapBackendRfq(data)
  } catch {
    return undefined
  }
}

export async function createPurchaseRfq(values: PurchaseRfqFormValues): Promise<RequestForQuotation> {
  if (USE_MOCK) {
    return delay({
      id: `rfq-${Date.now()}`,
      rfqNumber: `RFQ-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      purchaseRequestId: values.purchaseRequestId ?? null,
      title: values.title,
      requiredDate: values.requiredDate,
      status: "draft",
      invitedSupplierIds: values.invitedSupplierIds,
      notes: values.notes,
      createdAt: new Date().toISOString(),
      items: values.items.map((item, index) => ({
        id: `rfqi-${Date.now()}-${index}`,
        purchaseRfqId: `rfq-${Date.now()}`,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        reason: item.reason,
      })),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendRfq>("/purchase-rfqs", {
    companyId,
    purchaseRequestId: values.purchaseRequestId || undefined,
    title: values.title,
    requiredDate: values.requiredDate,
    invitedSupplierIds: values.invitedSupplierIds,
    notes: values.notes || undefined,
    items: values.items.map((item) => ({
      productVariantId: item.productId,
      quantity: item.quantity,
      reason: item.reason,
    })),
  })
  return mapBackendRfq(data)
}

export async function updatePurchaseRfqStatus(id: string, status: RequestForQuotationStatus): Promise<RequestForQuotation> {
  if (USE_MOCK) throw new Error("RFQ status updates are not available in mock mode")
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendRfq>(
    `/purchase-rfqs/${id}/status`,
    { status: mapRfqStatusToBackend(status) },
    { params: { companyId } },
  )
  return mapBackendRfq(data)
}

export async function fetchSupplierQuotations(purchaseRfqId?: string): Promise<SupplierQuotation[]> {
  if (USE_MOCK) return delay([])
  const companyId = await resolveCompanyId()
  const rows = await fetchAllPages<BackendSupplierQuotation>("/supplier-quotations", {
    companyId,
    purchaseRfqId,
  })
  return rows.map(mapBackendQuotation)
}

export async function fetchSupplierQuotationById(id: string): Promise<SupplierQuotation | undefined> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  try {
    const { data } = await apiClient.get<BackendSupplierQuotation>(`/supplier-quotations/${id}`, {
      params: { companyId },
    })
    return mapBackendQuotation(data)
  } catch {
    return undefined
  }
}

export async function createSupplierQuotation(values: SupplierQuotationFormValues): Promise<SupplierQuotation> {
  if (USE_MOCK) throw new Error("Supplier quotations are not available in mock mode")
  const companyId = await resolveCompanyId()
  const currency = await resolveCompanyCurrency(companyId)
  const { data } = await apiClient.post<BackendSupplierQuotation>("/supplier-quotations", {
    companyId,
    purchaseRfqId: values.purchaseRfqId,
    supplierId: values.supplierId,
    paymentTermId: values.paymentTermId || undefined,
    leadTimeDays: values.leadTimeDays ?? undefined,
    currency,
    notes: values.notes || undefined,
    items: values.items.map((item) => ({
      purchaseRfqItemId: item.purchaseRfqItemId,
      unitCost: item.unitCost.toFixed(2),
      discountAmount: item.discount ? item.discount.toFixed(2) : undefined,
      taxAmount: item.tax ? item.tax.toFixed(2) : undefined,
    })),
  })
  return mapBackendQuotation(data)
}

export async function updateSupplierQuotationStatus(id: string, status: SupplierQuotationStatus): Promise<SupplierQuotation> {
  if (USE_MOCK) throw new Error("Supplier quotation status updates are not available in mock mode")
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendSupplierQuotation>(
    `/supplier-quotations/${id}/status`,
    { status: mapQuotationStatusToBackend(status) },
    { params: { companyId } },
  )
  return mapBackendQuotation(data)
}
