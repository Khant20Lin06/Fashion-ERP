import { env } from "@/config/env"
import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { fetchInvoices } from "@/features/purchase/api/payment.api"
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
// @Controller("reports/ar-ap-aging") (not split /accounting/receivable +
// /accounting/payable), and payments live under the separate
// @Controller("payments") (not /accounting/payments). accounting/* itself
// only has accounts, general-ledger, journal-entries, trial-balance.

// --- AR / AP Aging ---
// The real endpoint returns per-customer/per-supplier aging buckets
// (current/1-30/31-60/61-90/over90 totals), not per-invoice rows with an
// invoiceNumber/dueDate/status. Rows below are mapped from the aggregate
// per-party total as the closest honest approximation; invoice-level
// fields are not fabricated.

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

type PaginatedResponse<T> = {
  data?: T[]
  meta?: {
    page?: number
    limit?: number
    total?: number
  } | null
}

type BackendPartyRow = {
  id: string
  name: string
}

let cachedAging: { result: BackendArApAgingResult; fetchedAt: number } | null = null

function normalizeOutstandingAmount(value: string | number): number {
  const amount = typeof value === "number" ? value : parseFloat(value) || 0
  return Math.abs(amount)
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
  return aging.receivables.map((row) => ({
    id: row.customerId,
    customerName: row.customerName,
    invoiceNumber: row.customerCode,
    date: aging.asOfDate,
    amount: normalizeOutstandingAmount(row.total),
    paid: 0,
    remaining: normalizeOutstandingAmount(row.total),
    dueDate: aging.asOfDate,
    status: overdueOf(row) > 0 ? "overdue" : "pending",
  }))
}

export async function fetchArMetrics(): Promise<ArMetrics> {
  if (USE_MOCK) return delay(arMetrics)
  const aging = await fetchAging()
  const totalOutstanding = normalizeOutstandingAmount(aging.totalReceivables)
  const overdueAmount = aging.receivables.reduce((sum, row) => sum + overdueOf(row), 0)

  return {
    totalOutstanding,
    overdueAmount: Math.abs(overdueAmount),
    paidAmount: 0,
    customerBalance: totalOutstanding,
  }
}

export async function fetchPayables(): Promise<PayableRow[]> {
  if (USE_MOCK) return delay(mockPayables)
  const invoices = await fetchInvoices()
  return invoices
    .filter((invoice) => invoice.balanceAmount > 0 || invoice.amountPaid > 0)
    .map((invoice) => ({
      id: invoice.id,
      supplierName: invoice.supplierName,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.grandTotal,
      paid: invoice.amountPaid,
      balance: invoice.balanceAmount,
      dueDate: invoice.dueDate,
      status: invoice.paymentStatus === "unpaid" ? "pending" : invoice.paymentStatus,
    }))
}

export async function fetchApMetrics(): Promise<ApMetrics> {
  if (USE_MOCK) return delay(apMetrics)
  const invoices = await fetchInvoices()
  const now = Date.now()
  const outstandingInvoices = invoices.filter((invoice) => invoice.balanceAmount > 0)
  const outstandingPayable = outstandingInvoices.reduce((sum, invoice) => sum + invoice.balanceAmount, 0)
  const paidAmount = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0)
  const dueThisWeek = outstandingInvoices.reduce((sum, invoice) => {
    const dueAt = new Date(invoice.dueDate).getTime()
    const daysUntilDue = (dueAt - now) / (1000 * 60 * 60 * 24)
    return daysUntilDue >= 0 && daysUntilDue <= 7 ? sum + invoice.balanceAmount : sum
  }, 0)
  return {
    outstandingPayable,
    dueThisWeek,
    paidAmount,
    supplierBalance: outstandingPayable,
  }
}

// --- Payments ---
// Real controller: @Controller("payments"). Every payment is created
// already confirmed; there is no status PATCH route.

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

async function fetchCustomersForJoin(companyId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    return await fetchAllPages<BackendPartyRow>("/customers", {
      companyId,
    })
  } catch {
    return []
  }
}

async function fetchSuppliersForJoin(companyId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    return await fetchAllPages<BackendPartyRow>("/suppliers", {
      companyId,
    })
  } catch {
    return []
  }
}

function mapBackendToFinancePayment(
  payment: BackendPayment,
  customers: Array<{ id: string; name: string }>,
  suppliers: Array<{ id: string; name: string }>,
): FinancePayment {
  const customerName = customers.find((customer) => customer.id === payment.customerId)?.name ?? ""
  const supplierName = suppliers.find((supplier) => supplier.id === payment.supplierId)?.name ?? ""
  const partyName =
    payment.direction === "RECEIPT"
      ? customerName || "Customer receipt"
      : supplierName || "Supplier payment"

  return {
    id: payment.id,
    reference: payment.paymentNumber,
    direction: payment.direction === "RECEIPT" ? "incoming" : "outgoing",
    partyName,
    relatedReference: payment.reference ?? undefined,
    amount: parseFloat(payment.amount) || 0,
    method: "bank_transfer",
    date: payment.paymentDate,
    status: "paid",
    createdBy: payment.createdBy ?? "",
  }
}

export async function fetchFinancePayments(): Promise<FinancePayment[]> {
  if (USE_MOCK) return delay(mockFinancePayments)
  const companyId = await resolveCompanyId()
  const [payments, customers, suppliers] = await Promise.all([
    fetchAllPages<BackendPayment>("/payments", {
      companyId,
    }),
    fetchCustomersForJoin(companyId),
    fetchSuppliersForJoin(companyId),
  ])
  return payments.map((payment) => mapBackendToFinancePayment(payment, customers, suppliers))
}

/**
 * NOT WIRED: the real POST /payments requires customerId/supplierId +
 * paymentMethodId UUID references and a non-empty allocations array tying
 * the payment to specific balances. The current form does not collect the
 * data needed to build that real payload yet.
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
    "Recording a payment from this form isn't available yet - it needs a customer or supplier picker, payment method picker, and allocation picker to call the real API.",
  )
}

export async function updateFinancePaymentStatus(id: string, status: FinancePaymentStatus): Promise<FinancePayment> {
  if (USE_MOCK) {
    const existing = mockFinancePayments.find((payment) => payment.id === id)
    if (!existing) throw new Error("Payment not found")
    return delay({ ...existing, status })
  }
  throw new Error("Payment status changes are not supported by the backend - payments are created already confirmed.")
}
