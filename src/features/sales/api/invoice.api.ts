import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { resolveBranchId, resolveWarehouseId } from "@/lib/api/resolve-org-ids"
import { resolveCompanyCurrency } from "@/lib/api/resolve-company-currency"
import { env } from "@/config/env"
import type { CartItem, LoyaltyTransaction, PaymentMethod, SalesInvoice } from "../types"
import { mockInvoices, mockLoyaltyTransactions } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ---------- Helpers for dynamic IDs resolution ----------
// CreateSaleDto.customerId is required (no backend "walk-in" sentinel
// exists) — POS checkout with no explicit customer must still resolve a
// real one. Prefers an ACTIVE customer over an arbitrary/possibly-inactive
// first result. Cached per company (not globally) so switching company
// context doesn't reuse a stale customer from a different company.
let _cachedCustomerId: string | undefined
let _cachedForCompanyId: string | undefined
async function resolveCustomerId(companyId: string, specifiedId?: string): Promise<string> {
  if (specifiedId && specifiedId !== "walk-in") return specifiedId
  if (_cachedCustomerId && _cachedForCompanyId === companyId) return _cachedCustomerId

  const { data } = await apiClient.get<{ data: Array<{ id: string; status?: string }> }>("/customers", {
    params: { companyId },
  })
  const customers = data.data ?? []
  const id = (customers.find((c) => c.status === "ACTIVE") ?? customers[0])?.id
  if (!id) {
    throw new Error("No customer found for walk-in checkout. Please create a customer first.")
  }

  _cachedCustomerId = id
  _cachedForCompanyId = companyId
  return id
}

type BackendPaymentMethod = {
  id: string
  companyId: string
  code: string
  name: string
  status: "ACTIVE" | "INACTIVE"
}

type BackendPaymentSummary = {
  id: string
  paymentMethodId: string
}

type BackendPaymentAllocation = {
  referenceType: string
  referenceId: string
}

type BackendPaymentDetail = BackendPaymentSummary & {
  allocations?: BackendPaymentAllocation[]
}

// PaymentMethod is a real, company-configured master-data entity (see
// GET /payment-methods) — not the frontend's fixed 5-value enum. Best-effort
// matches this POS panel's selection to a real PaymentMethod by code,
// falling back to the first ACTIVE one if no exact match exists, since the
// panel has no UI for picking a specific configured method. Throws if the
// company has none configured at all — checkout.ts (below) treats that as
// "sale confirmed, payment not recorded" rather than rolling back the sale.
async function fetchBackendPaymentMethods(companyId: string): Promise<BackendPaymentMethod[]> {
  const { data } = await apiClient.get<{ data: BackendPaymentMethod[]; meta: unknown }>("/payment-methods", {
    params: { companyId, limit: 100 },
  })
  return data.data ?? []
}

async function resolvePaymentMethodId(companyId: string, method: PaymentMethod): Promise<string> {
  const active = (await fetchBackendPaymentMethods(companyId)).filter((m) => m.status === "ACTIVE")
  if (active.length === 0) {
    throw new Error("No payment methods are configured for this company.")
  }
  const matched = active.find((m) => {
    const normalizedCode = normalizePaymentMethodToken(m.code)
    const normalizedName = normalizePaymentMethodToken(m.name)
    return normalizedCode === method || normalizedName === method
  })
  return (matched ?? active[0]).id
}

// ---------- Backend Types ----------
type BackendSaleItem = {
  id: string
  saleId: string
  productVariantId: string
  quantity: number
  unitPriceSnapshot: string
  discountSnapshot: string
  taxSnapshot: string
  lineTotal: string
  productNameSnapshot: string
  skuSnapshot: string
}

type BackendSale = {
  id: string
  saleNumber: string
  saleType: string
  customerId: string
  companyId: string
  branchId: string | null
  warehouseId: string | null
  transactionDate: string
  status: string
  subtotal: string
  discountAmount: string
  taxAmount: string
  grandTotal: string
  paidAmount: string
  balanceAmount: string
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
  items?: BackendSaleItem[]
}

function normalizePaymentMethodToken(value: string | null | undefined): PaymentMethod | undefined {
  if (!value) return undefined

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "")

  if (!normalized) return undefined
  if (normalized === "cash" || normalized.includes("cash")) return "cash"
  if (
    normalized === "card" ||
    normalized.includes("credit_card") ||
    normalized.includes("debit_card") ||
    normalized.endsWith("_card")
  ) {
    return "card"
  }
  if (normalized === "credit" || normalized.includes("on_credit")) return "credit"
  if (
    normalized === "bank_transfer" ||
    normalized.includes("bank_transfer") ||
    (normalized.includes("bank") && normalized.includes("transfer"))
  ) {
    return "bank_transfer"
  }
  if (
    normalized === "mobile_payment" ||
    normalized.includes("mobile_payment") ||
    normalized.includes("mobile") ||
    normalized.includes("wallet")
  ) {
    return "mobile_payment"
  }

  return undefined
}

function inferPaymentMethodFromSaleNotes(notes: string | null): PaymentMethod | undefined {
  if (!notes) return undefined
  const posNoteMatch = notes.match(/POS Checkout \(([^)]+)\)/i)
  return normalizePaymentMethodToken(posNoteMatch?.[1] ?? notes)
}

function mapSaleStatusToInvoiceStatus(status: string): SalesInvoice["status"] {
  if (status === "DRAFT" || status === "CANCELLED") return status
  return "CONFIRMED"
}

function resolvePaymentMethodFromEntity(
  paymentMethodId: string,
  paymentMethods: BackendPaymentMethod[],
): PaymentMethod | undefined {
  const method = paymentMethods.find((entry) => entry.id === paymentMethodId)
  if (!method) return undefined
  return (
    normalizePaymentMethodToken(method.code) ??
    normalizePaymentMethodToken(method.name)
  )
}

async function resolveInvoicePaymentMethod(
  sale: BackendSale,
  companyId: string,
): Promise<PaymentMethod | undefined> {
  const inferred = inferPaymentMethodFromSaleNotes(sale.notes)

  try {
    const paymentMethods = await fetchBackendPaymentMethods(companyId)
    const { data } = await apiClient.get<{ data: BackendPaymentSummary[]; meta: unknown }>("/payments", {
      params: {
        companyId,
        customerId: sale.customerId,
        direction: "RECEIPT",
        status: "CONFIRMED",
        limit: 100,
      },
    })

    const paymentSummaries = data.data ?? []
    if (paymentSummaries.length === 0) return inferred

    const paymentDetails = await Promise.all(
      paymentSummaries.map(async (payment) => {
        try {
          const { data: detail } = await apiClient.get<BackendPaymentDetail>(`/payments/${payment.id}`, {
            params: { companyId },
          })
          return detail
        } catch {
          return undefined
        }
      }),
    )

    const matchedPayment = paymentDetails.find((payment) =>
      payment?.allocations?.some(
        (allocation) => allocation.referenceType === "SALE" && allocation.referenceId === sale.id,
      ),
    )

    return (
      (matchedPayment
        ? resolvePaymentMethodFromEntity(matchedPayment.paymentMethodId, paymentMethods)
        : undefined) ?? inferred
    )
  } catch {
    return inferred
  }
}

// ---------- Mapper ----------
function mapBackendSaleToInvoice(
  sale: BackendSale,
  customers: Array<{ id: string, name: string }> = [],
  paymentMethod?: PaymentMethod,
): SalesInvoice {
  const items =
    sale.items?.map((item, index) => ({
      id: item.id || `item-${index}`,
      productId: item.productVariantId,
      productName: item.productNameSnapshot || item.productVariantId,
      sku: item.skuSnapshot || item.productVariantId,
      quantity: item.quantity,
      price: Number(item.unitPriceSnapshot || 0),
      discount: Number(item.discountSnapshot || 0),
      tax: Number(item.taxSnapshot || 0),
      total: Number(item.lineTotal || 0),
    })) || []

  const customerName = customers.find((c) => c.id === sale.customerId)?.name ?? "Walk-in Customer"

  return {
    id: sale.id,
    invoiceNumber: sale.saleNumber,
    date: sale.transactionDate,
    customerId: sale.customerId,
    customerName,
    salesPerson: "System Admin",
    warehouseId: sale.warehouseId,
    items,
    subtotal: Number(sale.subtotal || 0),
    discountTotal: Number(sale.discountAmount || 0),
    taxTotal: Number(sale.taxAmount || 0),
    grandTotal: Number(sale.grandTotal || 0),
    amountPaid: Number(sale.paidAmount || 0),
    paymentMethod: paymentMethod ?? inferPaymentMethodFromSaleNotes(sale.notes) ?? "cash",
    paymentStatus: Number(sale.balanceAmount || 0) <= 0 ? "paid" : "partial",
    status: mapSaleStatusToInvoiceStatus(sale.status),
  }
}

// --- Invoices ---

export async function fetchInvoices(): Promise<SalesInvoice[]> {
  if (USE_MOCK) return delay(mockInvoices)
  
  const companyId = await resolveCompanyId()
  const [salesRes, customersRes] = await Promise.all([
    apiClient.get<{ data: BackendSale[] }>("/sales", { params: { companyId, limit: 100 } }),
    apiClient.get<{ data: Array<{ id: string, name: string }> }>("/customers", { params: { companyId } })
  ])

  const sales = salesRes.data.data ?? []
  const customers = customersRes.data.data ?? []

  // Load items details for each sale
  const salesWithItems = await Promise.all(
    sales.map(async (sale) => {
      try {
        const { data: saleDetail } = await apiClient.get<BackendSale>(`/sales/${sale.id}`, { params: { companyId } })
        return saleDetail
      } catch {
        return sale
      }
    })
  )

  return salesWithItems.map((sale) => mapBackendSaleToInvoice(sale, customers))
}

export async function fetchInvoiceById(id: string): Promise<SalesInvoice | undefined> {
  if (USE_MOCK) return delay(mockInvoices.find((i) => i.id === id))
  
  const companyId = await resolveCompanyId()
  const [saleRes, customersRes] = await Promise.all([
    apiClient.get<BackendSale>(`/sales/${id}`, { params: { companyId } }),
    apiClient.get<{ data: Array<{ id: string, name: string }> }>("/customers", { params: { companyId } })
  ])

  const paymentMethod = await resolveInvoicePaymentMethod(saleRes.data, companyId)
  return mapBackendSaleToInvoice(saleRes.data, customersRes.data.data ?? [], paymentMethod)
}

export type CheckoutPayload = {
  customerId?: string
  items: CartItem[]
  paymentMethod: PaymentMethod
  amountTendered: number
  /** Real backend field CreateSaleDto.promotionCode — resolved/validated
   * and its discount computed entirely server-side (minimum purchase,
   * date window, usage limit, percentage-vs-fixed cap). The frontend
   * never recomputes or previews this discount amount; requires
   * sales.discount.apply, same as any non-zero per-item discountAmount. */
  promotionCode?: string
}

/** Finalizes a POS cart into an invoice — Cart -> Customer -> Discount -> Payment -> Invoice -> Stock Update. */
export async function checkoutCart(payload: CheckoutPayload): Promise<SalesInvoice> {
  if (USE_MOCK) {
    // simulated checkout logic remains unchanged
    const items = payload.items.map((item, index) => {
      const discountAmount = (item.price * item.quantity * item.discountPercent) / 100
      const total = item.price * item.quantity - discountAmount
      return {
        id: `sinvi-${Date.now()}-${index}`,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        discount: discountAmount,
        tax: total * 0.08,
        total: total * 1.08,
      }
    })
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0)
    const discountTotal = items.reduce((sum, i) => sum + i.discount, 0)
    const taxTotal = items.reduce((sum, i) => sum + i.tax, 0)
    const grandTotal = subtotal - discountTotal + taxTotal

    return delay({
      id: `sinv-${Date.now()}`,
      invoiceNumber: `SINV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      date: new Date().toISOString(),
      customerId: payload.customerId ?? "",
      customerName: "Walk-in Customer",
      salesPerson: "You",
      items,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      amountPaid: payload.amountTendered,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.amountTendered >= grandTotal ? "paid" : "partial",
      status: "CONFIRMED",
    })
  }

  const companyId = await resolveCompanyId()
  const [branchId, warehouseId, customerId, currency] = await Promise.all([
    resolveBranchId(companyId),
    resolveWarehouseId(companyId),
    resolveCustomerId(companyId, payload.customerId),
    resolveCompanyCurrency(companyId),
  ])

  // 1. Create a draft POS sale
  const salePayload = {
    companyId,
    branchId,
    warehouseId,
    customerId,
    saleType: "POS",
    currency,
    notes: `POS Checkout (${payload.paymentMethod})`,
    promotionCode: payload.promotionCode || undefined,
    items: payload.items.map((item) => {
      const discountAmount = (item.price * item.quantity * item.discountPercent) / 100
      return {
        productVariantId: item.id, // item.id is productVariantId in POS cart
        quantity: item.quantity,
        discountAmount: String(discountAmount),
        taxAmount: "0.00",
      }
    }),
  }

  const { data: createdSale } = await apiClient.post<BackendSale>("/sales", salePayload)

  // 2. Confirm the POS sale immediately to lock inventory and finalize
  const { data: confirmedSale } = await apiClient.post<BackendSale>(
    `/sales/${createdSale.id}/confirm`,
    {},
    { params: { companyId } },
  )

  // 3. Record the payment as a real Payment (direction=RECEIPT,
  // referenceType=SALE) so Sale.paidAmount/balanceAmount reflect what was
  // actually collected at the register, instead of staying 0/grandTotal
  // forever. The sale itself is already confirmed and stock already
  // deducted by this point — a failure here (e.g. no PaymentMethod
  // configured with a GL account, a genuine backend/admin gap) does not
  // roll back the sale, since the transaction did happen; it's surfaced to
  // the caller via `paymentRecordingFailed` on the resolved invoice instead
  // of silently pretending the sale is unpaid or throwing away the sale.
  let saleAfterPayment = confirmedSale
  let paymentRecordingFailed = false
  try {
    const paymentMethodId = await resolvePaymentMethodId(companyId, payload.paymentMethod)
    // The real backend honors an Idempotency-Key header on POST /payments
    // (see erp-pos fashion api PaymentsController) — a retried request
    // with the same key returns the existing payment instead of creating
    // a duplicate. confirmedSale.id is already a stable, unique identity
    // for this transaction, so it doubles as the key: a retried or
    // re-entrant call for the same confirmed sale can never post the
    // payment twice, without needing a separately generated UUID.
    await apiClient.post(
      "/payments",
      {
        companyId,
        branchId,
        direction: "RECEIPT",
        customerId,
        paymentMethodId,
        amount: Math.min(payload.amountTendered, Number(confirmedSale.grandTotal)).toFixed(2),
        currency,
        paymentDate: new Date().toISOString(),
        allocations: [
          {
            referenceType: "SALE",
            referenceId: confirmedSale.id,
            allocatedAmount: confirmedSale.grandTotal,
          },
        ],
      },
      { headers: { "Idempotency-Key": `sale-payment-${confirmedSale.id}` } },
    )
    const { data: refreshedSale } = await apiClient.get<BackendSale>(`/sales/${confirmedSale.id}`, {
      params: { companyId },
    })
    saleAfterPayment = refreshedSale
  } catch {
    paymentRecordingFailed = true
  }

  // Fetch customer details to get name
  const customersRes = await apiClient.get<{ data: Array<{ id: string, name: string }> }>("/customers", { params: { companyId } })

  const invoice = mapBackendSaleToInvoice(saleAfterPayment, customersRes.data.data ?? [])
  return paymentRecordingFailed ? { ...invoice, paymentRecordingFailed: true } : invoice
}

// --- Loyalty ---
// Real backend routes (erp-pos fashion api src/modules/loyalty):
//   GET  /loyalty/customers/:customerId              -> { customerId, availablePoints }
//   GET  /loyalty/customers/:customerId/transactions  -> {data, meta} of
//     { id, companyId, customerId, type, pointsDelta, redemptionValue,
//       sourceType, sourceId, reversesTransactionId, notes, createdAt }
//   POST /loyalty/customers/:customerId/redeem body { points, notes? }
// permission loyalty.read / loyalty.redeem. There is no membership-tier
// concept (bronze/silver/gold/…) anywhere in this module — that field on
// the frontend Customer type is a separate, still-unwired concern (see
// customer.api.ts).

type BackendLoyaltyTransaction = {
  id: string
  customerId: string
  type: string
  pointsDelta: number
  sourceType: string | null
  sourceId: string | null
  notes: string | null
  createdAt: string
}

function mapBackendLoyaltyTransaction(t: BackendLoyaltyTransaction): LoyaltyTransaction {
  return {
    id: t.id,
    customerId: t.customerId,
    type: t.pointsDelta >= 0 ? "earn" : "redeem",
    points: t.pointsDelta,
    reference: t.notes || t.sourceType || "Loyalty adjustment",
    date: t.createdAt,
  }
}

export async function fetchLoyaltyBalance(customerId: string): Promise<number> {
  if (USE_MOCK) {
    const earned = mockLoyaltyTransactions
      .filter((t) => t.customerId === customerId)
      .reduce((sum, t) => sum + t.points, 0)
    return delay(earned)
  }
  const { data } = await apiClient.get<{ customerId: string; availablePoints: number }>(
    `/loyalty/customers/${customerId}`,
  )
  return data.availablePoints
}

export async function fetchLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
  if (USE_MOCK) return delay(mockLoyaltyTransactions.filter((t) => t.customerId === customerId))
  const { data } = await apiClient.get<{ data: BackendLoyaltyTransaction[]; meta: unknown }>(
    `/loyalty/customers/${customerId}/transactions`,
    { params: { limit: 100 } },
  )
  return (data.data ?? []).map(mapBackendLoyaltyTransaction)
}

export async function redeemLoyaltyPoints(customerId: string, points: number): Promise<LoyaltyTransaction> {
  if (USE_MOCK) {
    return delay({
      id: `loy-${Date.now()}`,
      customerId,
      type: "redeem",
      points: -points,
      reference: "Manual redemption",
      date: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<BackendLoyaltyTransaction>(`/loyalty/customers/${customerId}/redeem`, {
    points,
  })
  return mapBackendLoyaltyTransaction(data)
}
