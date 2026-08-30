import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { PaymentTermOption, Supplier, SupplierPerformance } from "../types"
import type { SupplierFormValues } from "../schemas/supplier.schema"
import { mockSupplierPerformance, mockSuppliers } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// The real CreateSupplierDto/UpdateSupplierDto/SupplierResponseDto
// (src/modules/customer-supplier/dto/*.ts) have no `type`, `website`,
// `address`, `taxId`, `currency`, or `bankAccount` fields, model
// payment terms as a `paymentTermId` UUID FK rather than free text, and
// have no `contactPerson` field at all. Redesigning SupplierForm's UI is
// beyond a contract-audit's "smallest safe change" scope, so this layer
// maps only the fields that exist on both sides; the rest are accepted by
// the form (preserved locally) but never sent, since the backend's global
// ValidationPipe (forbidNonWhitelisted: true) would 400 on unknown fields.

type BackendSupplierStatus = "ACTIVE" | "INACTIVE" | "BLOCKED"

type BackendSupplier = {
  id: string
  companyId: string
  branchId: string | null
  supplierCode: string
  name: string
  displayName: string | null
  phone: string | null
  email: string | null
  country: string | null
  supplierGroupId: string | null
  paymentTermId: string | null
  creditDays: number
  openingBalanceAmount: string
  payableAccountId: string | null
  status: BackendSupplierStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

type BackendPaymentTerm = {
  id: string
  code?: string
  name: string
  dueDays?: number
}

type PaginatedResponse<T> = {
  data?: T[]
  meta?: {
    page?: number
    limit?: number
    total?: number
  } | null
}

function formatPaymentTermLabel(name: string, dueDays: number): string {
  const trimmedName = name.trim()
  if (dueDays === 0) return "Immediate"
  if (!trimmedName || /^cash$/i.test(trimmedName)) return `Net ${dueDays}`
  return trimmedName
}

function mapStatusToBackend(status: SupplierFormValues["status"]): BackendSupplierStatus {
  if (status === "blocked") return "BLOCKED"
  return status === "active" ? "ACTIVE" : "INACTIVE"
}

function mapStatusFromBackend(status: BackendSupplierStatus): Supplier["status"] {
  if (status === "BLOCKED") return "blocked"
  return status === "ACTIVE" ? "active" : "inactive"
}

function mapBackendToSupplier(bs: BackendSupplier, paymentTermsById: Map<string, string> = new Map()): Supplier {
  return {
    id: bs.id,
    name: bs.name,
    code: bs.supplierCode,
    paymentTermId: bs.paymentTermId,
    // No backend equivalent — not returned, defaulted for display only.
    type: "manufacturer",
    status: mapStatusFromBackend(bs.status),
    contactPerson: bs.displayName ?? "",
    phone: bs.phone ?? "",
    email: bs.email ?? "",
    country: bs.country ?? "",
    creditDays: bs.creditDays,
    openingBalance: parseFloat(bs.openingBalanceAmount) || 0,
    notes: bs.notes ?? "",
    paymentTerms: bs.paymentTermId ? paymentTermsById.get(bs.paymentTermId) ?? "" : "",
    totalPurchase: 0,
    outstanding: parseFloat(bs.openingBalanceAmount) || 0,
  }
}

function truncateSupplierCode(code: string): string {
  const truncated = code.slice(0, 50).replace(/-+$/g, "")
  return truncated || "SUP-ITEM"
}

function buildSupplierBaseCode(name: string): string {
  const slug =
    name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "ITEM"

  return truncateSupplierCode(`SUP-${slug}`)
}

function appendSupplierCodeSuffix(baseCode: string, suffix: number): string {
  const suffixText = `-${suffix}`
  const maxBaseLength = 50 - suffixText.length
  const truncatedBase = baseCode.slice(0, maxBaseLength).replace(/-+$/g, "")
  return `${truncatedBase}${suffixText}`
}

async function fetchPaymentTermsById(companyId: string): Promise<Map<string, string>> {
  try {
    const { data } = await apiClient.get<{ data: BackendPaymentTerm[]; meta: unknown }>("/payment-terms", {
      params: { companyId, limit: 100 },
    })
    return new Map(
      (data.data ?? []).map((term) => [term.id, formatPaymentTermLabel(term.name, term.dueDays ?? 0)])
    )
  } catch {
    return new Map()
  }
}

async function fetchAllSuppliersForCompany(companyId: string): Promise<BackendSupplier[]> {
  const limit = 100
  let page = 1
  let total = Number.POSITIVE_INFINITY
  const rows: BackendSupplier[] = []

  while (rows.length < total) {
    const { data } = await apiClient.get<PaginatedResponse<BackendSupplier>>("/suppliers", {
      params: { companyId, page, limit },
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

export async function fetchSupplierPaymentTerms(): Promise<PaymentTermOption[]> {
  if (USE_MOCK) {
    return delay([
      { id: "term-immediate", name: "Immediate", dueDays: 0 },
      { id: "term-net-15", name: "Net 15", dueDays: 15 },
      { id: "term-net-30", name: "Net 30", dueDays: 30 },
      { id: "term-net-45", name: "Net 45", dueDays: 45 },
    ])
  }
  const companyId = await resolveCompanyId()
  try {
    const { data } = await apiClient.get<{ data: BackendPaymentTerm[]; meta: unknown }>("/payment-terms", {
      params: { companyId, limit: 100 },
    })
    return (data.data ?? []).map((term) => ({
      id: term.id,
      name: formatPaymentTermLabel(term.name, term.dueDays ?? 0),
      dueDays: term.dueDays ?? 0,
    }))
  } catch {
    return []
  }
}

async function resolveCreateSupplierCode(
  companyId: string,
  requestedCode: string | undefined,
  name: string,
): Promise<string> {
  const normalizedRequestedCode = requestedCode?.trim()
  if (normalizedRequestedCode) return normalizedRequestedCode

  try {
    const existingSuppliers = await fetchAllSuppliersForCompany(companyId)
    const existingCodes = new Set(existingSuppliers.map((supplier) => supplier.supplierCode))
    const baseCode = buildSupplierBaseCode(name)
    let candidate = baseCode
    let suffix = 2

    while (existingCodes.has(candidate)) {
      candidate = appendSupplierCodeSuffix(baseCode, suffix)
      suffix += 1
    }

    return candidate
  } catch {
    return appendSupplierCodeSuffix(buildSupplierBaseCode(name), Date.now() % 100000)
  }
}

async function applySupplierMetrics(suppliers: Supplier[]): Promise<Supplier[]> {
  if (USE_MOCK || suppliers.length === 0) return suppliers

  try {
    const [{ fetchPurchaseOrders }, { fetchInvoices }] = await Promise.all([
      import("./purchase-order.api"),
      import("./payment.api"),
    ])
    const [purchaseOrders, invoices] = await Promise.all([fetchPurchaseOrders(), fetchInvoices()])
    const activeOrders = purchaseOrders.filter((order) => !["draft", "cancelled"].includes(order.status))

    const totalsBySupplier = new Map<string, { totalPurchase: number; outstanding: number }>()
    for (const order of activeOrders) {
      const metrics = totalsBySupplier.get(order.supplierId) ?? { totalPurchase: 0, outstanding: 0 }
      metrics.totalPurchase += order.grandTotal
      totalsBySupplier.set(order.supplierId, metrics)
    }

    for (const invoice of invoices) {
      const metrics = totalsBySupplier.get(invoice.supplierId) ?? { totalPurchase: 0, outstanding: 0 }
      metrics.outstanding += invoice.balanceAmount
      totalsBySupplier.set(invoice.supplierId, metrics)
    }

    return suppliers.map((supplier) => {
      const metrics = totalsBySupplier.get(supplier.id)
      if (!metrics) return supplier
      return {
        ...supplier,
        totalPurchase: metrics.totalPurchase,
        outstanding: supplier.outstanding + metrics.outstanding,
      }
    })
  } catch {
    return suppliers
  }
}

/** Only the fields CreateSupplierDto/UpdateSupplierDto actually accept. */
function mapSupplierFormToCreatePayload(values: SupplierFormValues) {
  return {
    name: values.name,
    displayName: values.contactPerson || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    country: values.country || undefined,
    paymentTermId: values.paymentTermId || undefined,
    creditDays: values.creditDays,
    openingBalanceAmount: values.openingBalanceAmount,
    notes: values.notes || undefined,
  }
}

/** UpdateSupplierDto has no `supplierCode` or `status` field — supplierCode is immutable after
 * creation, and status transitions are separate POST :id/activate/:id/deactivate/:id/block actions. */
function mapSupplierFormToUpdatePayload(values: SupplierFormValues) {
  return {
    name: values.name,
    displayName: values.contactPerson || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    country: values.country || undefined,
    paymentTermId: values.paymentTermId || undefined,
    creditDays: values.creditDays,
    openingBalanceAmount: values.openingBalanceAmount,
    notes: values.notes || undefined,
  }
}

async function transitionSupplierStatus(
  id: string,
  companyId: string,
  desiredStatus: BackendSupplierStatus,
): Promise<BackendSupplier> {
  const action = desiredStatus === "ACTIVE" ? "activate" : desiredStatus === "BLOCKED" ? "block" : "deactivate"
  const { data } = await apiClient.request<BackendSupplier>({
    url: `/suppliers/${id}/${action}`,
    method: "POST",
    params: { companyId },
  })
  return data
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  if (USE_MOCK) return delay(mockSuppliers)
  const companyId = await resolveCompanyId()
  // Backend list endpoints return a `{ data, meta }` pagination envelope,
  // never a bare array — see src/modules/customer-supplier/controllers on
  // the backend. Unwrapping `data` directly here previously handed the
  // envelope object to callers expecting `Supplier[]`, breaking `.map()`.
  const [suppliers, paymentTermsById] = await Promise.all([
    fetchAllSuppliersForCompany(companyId),
    fetchPaymentTermsById(companyId),
  ])
  return applySupplierMetrics(suppliers.map((supplier) => mapBackendToSupplier(supplier, paymentTermsById)))
}

export async function fetchSupplierById(id: string): Promise<Supplier | null> {
  if (USE_MOCK) return delay(mockSuppliers.find((s) => s.id === id) ?? null)
  const companyId = await resolveCompanyId()
  try {
    const [{ data }, paymentTermsById] = await Promise.all([
      apiClient.get<BackendSupplier>(`/suppliers/${id}`, { params: { companyId } }),
      fetchPaymentTermsById(companyId),
    ])
    const [supplierWithMetrics] = await applySupplierMetrics([mapBackendToSupplier(data, paymentTermsById)])
    return supplierWithMetrics
  } catch {
    return null
  }
}

// No `/suppliers/:id/performance` endpoint exists on the backend
// (src/modules/customer-supplier/controllers/suppliers.controller.ts has
// no such route) — genuine BACKEND GAP, not a frontend bug. Returns
// undefined rather than calling a fictional endpoint or inventing data.
export async function fetchSupplierPerformance(id: string): Promise<SupplierPerformance | null> {
  if (USE_MOCK) return delay(mockSupplierPerformance[id] ?? null)
  return null
}

export async function createSupplier(values: SupplierFormValues): Promise<Supplier> {
  if (USE_MOCK) {
    const code = values.code ?? buildSupplierBaseCode(values.name)
    return delay({
      id: `sup-${Date.now()}`,
      name: values.name,
      code,
      paymentTermId: values.paymentTermId || null,
      type: values.type,
      status: values.status,
      contactPerson: values.contactPerson,
      phone: values.phone,
      email: values.email,
      country: values.country,
      creditDays: values.creditDays,
      openingBalance: Number(values.openingBalanceAmount) || 0,
      notes: values.notes,
      paymentTerms: "",
      totalPurchase: 0,
      outstanding: Number(values.openingBalanceAmount) || 0,
    })
  }
  const companyId = await resolveCompanyId()
  const supplierCode = await resolveCreateSupplierCode(companyId, values.code, values.name)
  const { data } = await apiClient.post<BackendSupplier>("/suppliers", {
    companyId,
    supplierCode,
    ...mapSupplierFormToCreatePayload(values),
  })
  const desiredStatus = mapStatusToBackend(values.status)
  const savedSupplier = desiredStatus === data.status ? data : await transitionSupplierStatus(data.id, companyId, desiredStatus)
  const paymentTermsById = await fetchPaymentTermsById(companyId)
  return mapBackendToSupplier(savedSupplier, paymentTermsById)
}

export async function updateSupplier(id: string, values: SupplierFormValues): Promise<Supplier> {
  if (USE_MOCK) {
    const existing = mockSuppliers.find((s) => s.id === id)
    if (!existing) throw new Error("Supplier not found")
    return delay({
      ...existing,
      name: values.name,
      code: existing.code,
      paymentTermId: values.paymentTermId || null,
      type: values.type,
      status: values.status,
      contactPerson: values.contactPerson,
      phone: values.phone,
      email: values.email,
      country: values.country,
      creditDays: values.creditDays,
      openingBalance: Number(values.openingBalanceAmount) || 0,
      notes: values.notes,
    })
  }
  const companyId = await resolveCompanyId()
  // Real backend has no PUT route — only PATCH.
  const { data } = await apiClient.patch<BackendSupplier>(
    `/suppliers/${id}`,
    mapSupplierFormToUpdatePayload(values),
    { params: { companyId } },
  )
  const desiredStatus = mapStatusToBackend(values.status)
  if (desiredStatus !== data.status) {
    const afterStatus = await transitionSupplierStatus(id, companyId, desiredStatus)
    const paymentTermsById = await fetchPaymentTermsById(companyId)
    return mapBackendToSupplier(afterStatus, paymentTermsById)
  }
  const paymentTermsById = await fetchPaymentTermsById(companyId)
  return mapBackendToSupplier(data, paymentTermsById)
}

export async function deleteSupplier(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/suppliers/${id}`, { params: { companyId } })
}
