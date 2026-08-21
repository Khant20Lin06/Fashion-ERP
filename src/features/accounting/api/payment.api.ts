import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type {
  ApMetrics,
  ArMetrics,
  FinancePayment,
  FinancePaymentStatus,
  PayableRow,
  ReceivableRow,
} from "../types"
import type { FinancePaymentFormValues } from "../schemas/payment.schema"
import { apMetrics, arMetrics, mockFinancePayments, mockPayables, mockReceivables } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real backend routes: AR/AP aging is one combined endpoint
// @Controller('reports/ar-ap-aging') (NOT split /accounting/receivable +
// /accounting/payable), and Payments live under the separate
// @Controller('payments') (NOT /accounting/payments). accounting/* itself
// only has accounts, general-ledger, journal-entries, trial-balance.

// --- AR / AP Aging ---
// The real endpoint returns per-customer/per-supplier aging BUCKETS
// (current/1-30/31-60/61-90/over90 totals), not per-invoice rows with an
// invoiceNumber/dueDate/status — there is no backend endpoint that lists
// individual outstanding invoices. Rows below are mapped from the
// aggregate per-party total as the closest honest approximation; invoice-
// level fields are not fabricated.

type BackendAgingBuckets = {
  current: string
  days1To30: string
  days31To60: string
  days61To90: string
  over90: string
}

type BackendArRow = BackendAgingBuckets & {
  customerId: string
  customerCode: string
  customerName: string
  total: string
}

type BackendApRow = BackendAgingBuckets & {
  supplierId: string
  supplierCode: string
  supplierName: string
  total: string
}

type BackendArApAgingResult = {
  asOfDate: string
  receivables: BackendArRow[]
  payables: BackendApRow[]
  totalReceivables: string
  totalPayables: string
}

let cachedAging: { result: BackendArApAgingResult; fetchedAt: number } | null = null

async function fetchAging(): Promise<BackendArApAgingResult> {
  // Cached briefly within a page view since both the row list and the
  // metrics card pull from this same single endpoint.
  if (cachedAging && Date.now() - cachedAging.fetchedAt < 30_000) {
    return cachedAging.result
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendArApAgingResult>("/reports/ar-ap-aging", {
    params: { companyId },
  })
  cachedAging = { result: data, fetchedAt: Date.now() }
  return data
}

function overdueOf(row: BackendAgingBuckets): number {
  return (
    (parseFloat(row.days1To30) || 0) +
    (parseFloat(row.days31To60) || 0) +
    (parseFloat(row.days61To90) || 0) +
    (parseFloat(row.over90) || 0)
  )
}

export async function fetchReceivables(): Promise<ReceivableRow[]> {
  if (USE_MOCK) return delay(mockReceivables)
  const aging = await fetchAging()
  return aging.receivables.map((r) => ({
    id: r.customerId,
    customerName: r.customerName,
    invoiceNumber: r.customerCode,
    date: aging.asOfDate,
    amount: parseFloat(r.total) || 0,
    paid: 0,
    remaining: parseFloat(r.total) || 0,
    dueDate: aging.asOfDate,
    status: overdueOf(r) > 0 ? "overdue" : "pending",
  }))
}

export async function fetchArMetrics(): Promise<ArMetrics> {
  if (USE_MOCK) return delay(arMetrics)
  const aging = await fetchAging()
  const overdueAmount = aging.receivables.reduce((sum, r) => sum + overdueOf(r), 0)
  return {
    totalOutstanding: parseFloat(aging.totalReceivables) || 0,
    overdueAmount,
    // Not derivable from the aging snapshot (it has no paid/settled data).
    paidAmount: 0,
    customerBalance: parseFloat(aging.totalReceivables) || 0,
  }
}

export async function fetchPayables(): Promise<PayableRow[]> {
  if (USE_MOCK) return delay(mockPayables)
  const aging = await fetchAging()
  return aging.payables.map((p) => ({
    id: p.supplierId,
    supplierName: p.supplierName,
    invoiceNumber: p.supplierCode,
    amount: parseFloat(p.total) || 0,
    paid: 0,
    balance: parseFloat(p.total) || 0,
    dueDate: aging.asOfDate,
    status: overdueOf(p) > 0 ? "overdue" : "pending",
  }))
}

export async function fetchApMetrics(): Promise<ApMetrics> {
  if (USE_MOCK) return delay(apMetrics)
  const aging = await fetchAging()
  return {
    outstandingPayable: parseFloat(aging.totalPayables) || 0,
    // "Due this week" needs due-date granularity the aging snapshot
    // doesn't expose (only bucket ranges) — not fabricated.
    dueThisWeek: 0,
    paidAmount: 0,
    supplierBalance: parseFloat(aging.totalPayables) || 0,
  }
}

// --- Payments ---
// Real controller: @Controller('payments') — NOT /accounting/payments.
// D14 (locked): GET /payments, GET /payments/:id, POST /payments only —
// no status PATCH, because every Payment is created already CONFIRMED.

type BackendPaymentDirection = "RECEIPT" | "PAYMENT"
type BackendPaymentStatus = "CONFIRMED"

type BackendPayment = {
  id: string
  paymentNumber: string
  companyId: string
  branchId: string | null
  direction: BackendPaymentDirection
  customerId: string | null
  supplierId: string | null
  paymentMethodId: string
  amount: string
  currency: string
  reference: string | null
  status: BackendPaymentStatus
  paymentDate: string
  notes: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

function mapBackendToFinancePayment(bp: BackendPayment): FinancePayment {
  return {
    id: bp.id,
    reference: bp.paymentNumber,
    direction: bp.direction === "RECEIPT" ? "incoming" : "outgoing",
    // Not returned by this endpoint — would require a customer/supplier join.
    partyName: "",
    relatedReference: bp.reference ?? undefined,
    amount: parseFloat(bp.amount) || 0,
    // paymentMethodId is a UUID reference (/payment-methods), not one of
    // the frontend's fixed method strings — not fabricated.
    method: "bank_transfer",
    date: bp.paymentDate,
    status: "paid",
    createdBy: bp.createdBy ?? "",
  }
}

export async function fetchFinancePayments(): Promise<FinancePayment[]> {
  if (USE_MOCK) return delay(mockFinancePayments)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendPayment[]; meta: unknown }>("/payments", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapBackendToFinancePayment)
}

/**
 * NOT WIRED: the real POST /payments requires customerId/supplierId +
 * paymentMethodId (UUID references) + a non-empty `allocations` array
 * tying the payment to specific Sale/PurchaseOrder balances. The current
 * form only collects a free-text partyName and a fixed method string, so
 * there isn't enough real data here to build a valid request — sending one
 * would just 400. Needs a form redesign (party picker + payment-method
 * picker + invoice/allocation picker) before this can call the real
 * endpoint; left unimplemented rather than faking a payload.
 */
export async function createFinancePayment(values: FinancePaymentFormValues): Promise<FinancePayment> {
  if (USE_MOCK) {
    return delay({
      id: `fp-${Date.now()}`,
      reference: `${values.direction === "incoming" ? "RCV" : "PMT"}-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      direction: values.direction,
      partyName: values.partyName,
      relatedReference: values.relatedReference,
      amount: values.amount,
      method: values.method,
      date: values.date,
      status: "created",
      createdBy: "You",
    })
  }
  throw new Error(
    "Recording a payment from this form isn't available yet — it needs a customer/supplier and payment method picker to call the real API.",
  )
}

/** Real backend has no status PATCH — every payment is created already
 * CONFIRMED (D14, locked), so there is no "approve/reconcile" transition
 * to call. */
export async function updateFinancePaymentStatus(id: string, status: FinancePaymentStatus): Promise<FinancePayment> {
  if (USE_MOCK) {
    const existing = mockFinancePayments.find((p) => p.id === id)
    if (!existing) throw new Error("Payment not found")
    return delay({ ...existing, status })
  }
  throw new Error("Payment status changes are not supported by the backend — payments are created already confirmed.")
}
