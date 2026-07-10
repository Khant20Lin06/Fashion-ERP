import { apiClient } from "@/lib/api/client"
import type {
  CustomerAnalyticsSummary,
  ProductPerformancePoint,
  RevenueTrendGranularity,
  RevenueTrendPoint,
  SalesKpis,
  SalesOrder,
  SalesOrderStatus,
} from "../types"
import type { SalesOrderFormValues } from "../schemas/sales.schema"
import {
  customerAnalyticsSummary,
  mockCustomers,
  mockInvoices,
  mockSalesOrders,
  productPerformance,
  revenueTrendByGranularity,
} from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function computeLineTotal(quantity: number, price: number, discount: number, tax: number) {
  return quantity * price - discount + tax
}

// --- Sales Orders ---

export async function fetchSalesOrders(): Promise<SalesOrder[]> {
  if (USE_MOCK) return delay(mockSalesOrders)
  const { data } = await apiClient.get<SalesOrder[]>("/sales/orders")
  return data
}

export async function fetchSalesOrderById(id: string): Promise<SalesOrder | undefined> {
  if (USE_MOCK) return delay(mockSalesOrders.find((o) => o.id === id))
  const { data } = await apiClient.get<SalesOrder>(`/sales/orders/${id}`)
  return data
}

export async function createSalesOrder(values: SalesOrderFormValues): Promise<SalesOrder> {
  if (USE_MOCK) {
    const customer = mockCustomers.find((c) => c.id === values.customerId)
    const items = values.items.map((item, index) => ({
      id: `soi-${Date.now()}-${index}`,
      ...item,
      total: computeLineTotal(item.quantity, item.price, item.discount, item.tax),
    }))
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0)
    const discountTotal = items.reduce((sum, i) => sum + i.discount, 0)
    const taxTotal = items.reduce((sum, i) => sum + i.tax, 0)
    return delay({
      id: `so-${Date.now()}`,
      orderNumber: `SO-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      customerId: values.customerId,
      customerName: customer?.name ?? "",
      items,
      deliveryDate: values.deliveryDate,
      paymentTerms: values.paymentTerms,
      notes: values.notes,
      status: "draft",
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal: subtotal - discountTotal + taxTotal,
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<SalesOrder>("/sales/orders", values)
  return data
}

export async function updateSalesOrderStatus(id: string, status: SalesOrderStatus): Promise<SalesOrder> {
  if (USE_MOCK) {
    const existing = mockSalesOrders.find((o) => o.id === id)
    if (!existing) throw new Error("Sales order not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<SalesOrder>(`/sales/orders/${id}/status`, { status })
  return data
}

// --- Dashboard / Analytics ---

export async function fetchSalesKpis(): Promise<SalesKpis> {
  if (USE_MOCK) {
    const today = new Date().toDateString()
    const todaysInvoices = mockInvoices.filter((inv) => new Date(inv.date).toDateString() === today)
    const todaysSales = todaysInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0) || 1245
    const monthlyRevenue = mockInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0) * 8
    return delay({
      todaysSales,
      todaysSalesChangePercent: 15,
      monthlyRevenue,
      orders: mockSalesOrders.length + mockInvoices.length,
      customers: mockCustomers.length,
    })
  }
  const { data } = await apiClient.get<SalesKpis>("/sales/kpis")
  return data
}

export async function fetchRevenueTrend(granularity: RevenueTrendGranularity): Promise<RevenueTrendPoint[]> {
  if (USE_MOCK) return delay(revenueTrendByGranularity[granularity])
  const { data } = await apiClient.get<RevenueTrendPoint[]>("/sales/analytics/revenue-trend", {
    params: { granularity },
  })
  return data
}

export async function fetchProductPerformance(): Promise<ProductPerformancePoint[]> {
  if (USE_MOCK) return delay(productPerformance)
  const { data } = await apiClient.get<ProductPerformancePoint[]>("/sales/analytics/product-performance")
  return data
}

export async function fetchCustomerAnalyticsSummary(): Promise<CustomerAnalyticsSummary> {
  if (USE_MOCK) return delay(customerAnalyticsSummary)
  const { data } = await apiClient.get<CustomerAnalyticsSummary>("/sales/analytics/customers")
  return data
}
