import { apiClient } from "@/lib/api/client"
import type { CartItem, DiscountRule, LoyaltyTransaction, PaymentMethod, SalesInvoice } from "../types"
import { mockCustomers, mockDiscountRules, mockInvoices, mockLoyaltyTransactions } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Invoices ---

export async function fetchInvoices(): Promise<SalesInvoice[]> {
  if (USE_MOCK) return delay(mockInvoices)
  const { data } = await apiClient.get<SalesInvoice[]>("/sales/invoices")
  return data
}

export async function fetchInvoiceById(id: string): Promise<SalesInvoice | undefined> {
  if (USE_MOCK) return delay(mockInvoices.find((i) => i.id === id))
  const { data } = await apiClient.get<SalesInvoice>(`/sales/invoices/${id}`)
  return data
}

export type CheckoutPayload = {
  customerId?: string
  items: CartItem[]
  paymentMethod: PaymentMethod
  amountTendered: number
}

/** Finalizes a POS cart into an invoice — Cart -> Customer -> Discount -> Payment -> Invoice -> Stock Update. */
export async function checkoutCart(payload: CheckoutPayload): Promise<SalesInvoice> {
  if (USE_MOCK) {
    const customer = mockCustomers.find((c) => c.id === payload.customerId)
    const items = payload.items.map((item, index) => {
      const discountAmount = (item.price * item.quantity * item.discountPercent) / 100
      const total = item.price * item.quantity - discountAmount
      return {
        id: `sinvi-${Date.now()}-${index}`,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        color: item.color,
        size: item.size,
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
      customerName: customer?.name ?? "Walk-in Customer",
      salesPerson: "You",
      items,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      amountPaid: payload.amountTendered,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.amountTendered >= grandTotal ? "paid" : "partial",
      status: "closed",
    })
  }
  const { data } = await apiClient.post<SalesInvoice>("/sales/checkout", payload)
  return data
}

// --- Discounts ---

export async function fetchDiscountRules(): Promise<DiscountRule[]> {
  if (USE_MOCK) return delay(mockDiscountRules)
  const { data } = await apiClient.get<DiscountRule[]>("/sales/discounts")
  return data
}

export async function toggleDiscountRule(id: string, isActive: boolean): Promise<DiscountRule> {
  if (USE_MOCK) {
    const existing = mockDiscountRules.find((d) => d.id === id)
    if (!existing) throw new Error("Discount rule not found")
    return delay({ ...existing, isActive })
  }
  const { data } = await apiClient.patch<DiscountRule>(`/sales/discounts/${id}`, { isActive })
  return data
}

// --- Loyalty ---

export async function fetchLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
  if (USE_MOCK) return delay(mockLoyaltyTransactions.filter((t) => t.customerId === customerId))
  const { data } = await apiClient.get<LoyaltyTransaction[]>(`/customers/${customerId}/loyalty`)
  return data
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
  const { data } = await apiClient.post<LoyaltyTransaction>(`/customers/${customerId}/loyalty/redeem`, { points })
  return data
}
