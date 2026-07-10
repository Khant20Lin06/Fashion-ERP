import { apiClient } from "@/lib/api/client"
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

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Accounts Receivable ---

export async function fetchReceivables(): Promise<ReceivableRow[]> {
  if (USE_MOCK) return delay(mockReceivables)
  const { data } = await apiClient.get<ReceivableRow[]>("/accounting/receivable")
  return data
}

export async function fetchArMetrics(): Promise<ArMetrics> {
  if (USE_MOCK) return delay(arMetrics)
  const { data } = await apiClient.get<ArMetrics>("/accounting/receivable/metrics")
  return data
}

// --- Accounts Payable ---

export async function fetchPayables(): Promise<PayableRow[]> {
  if (USE_MOCK) return delay(mockPayables)
  const { data } = await apiClient.get<PayableRow[]>("/accounting/payable")
  return data
}

export async function fetchApMetrics(): Promise<ApMetrics> {
  if (USE_MOCK) return delay(apMetrics)
  const { data } = await apiClient.get<ApMetrics>("/accounting/payable/metrics")
  return data
}

// --- Payments ---

export async function fetchFinancePayments(): Promise<FinancePayment[]> {
  if (USE_MOCK) return delay(mockFinancePayments)
  const { data } = await apiClient.get<FinancePayment[]>("/accounting/payments")
  return data
}

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
  const { data } = await apiClient.post<FinancePayment>("/accounting/payments", values)
  return data
}

export async function updateFinancePaymentStatus(id: string, status: FinancePaymentStatus): Promise<FinancePayment> {
  if (USE_MOCK) {
    const existing = mockFinancePayments.find((p) => p.id === id)
    if (!existing) throw new Error("Payment not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<FinancePayment>(`/accounting/payments/${id}/status`, { status })
  return data
}
