import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type {
  ProductCostPoint,
  PurchaseKpis,
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseRequest,
  PurchaseTrendPoint,
} from "../types"
import type { PurchaseOrderFormValues, PurchaseRequestFormValues } from "../schemas/purchase.schema"
import {
  mockPurchaseOrders,
  mockPurchaseRequests,
  mockSuppliers,
  productCostAnalysis,
  purchaseTrend,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function computeLineAmount(quantity: number, unitCost: number, discount: number, tax: number) {
  return quantity * unitCost - discount + tax
}

// --- Purchase Requests ---

export async function fetchPurchaseRequests(): Promise<PurchaseRequest[]> {
  if (USE_MOCK) return delay(mockPurchaseRequests)
  const { data } = await apiClient.get<PurchaseRequest[]>("/purchase/requests")
  return data
}

export async function createPurchaseRequest(values: PurchaseRequestFormValues): Promise<PurchaseRequest> {
  if (USE_MOCK) {
    return delay({
      id: `pr-${Date.now()}`,
      reference: `PR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      department: values.department,
      requester: values.requester,
      requiredDate: values.requiredDate,
      status: "draft",
      items: values.items.map((item, index) => ({ id: `pri-${Date.now()}-${index}`, ...item })),
      notes: values.notes,
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<PurchaseRequest>("/purchase/requests", values)
  return data
}

export async function updatePurchaseRequestStatus(id: string, status: PurchaseRequest["status"]): Promise<PurchaseRequest> {
  if (USE_MOCK) {
    const existing = mockPurchaseRequests.find((r) => r.id === id)
    if (!existing) throw new Error("Purchase request not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<PurchaseRequest>(`/purchase/requests/${id}/status`, { status })
  return data
}

// --- Purchase Orders ---

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  if (USE_MOCK) return delay(mockPurchaseOrders)
  const { data } = await apiClient.get<PurchaseOrder[]>("/purchase/orders")
  return data
}

export async function fetchPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
  if (USE_MOCK) return delay(mockPurchaseOrders.find((o) => o.id === id))
  const { data } = await apiClient.get<PurchaseOrder>(`/purchase/orders/${id}`)
  return data
}

export async function createPurchaseOrder(values: PurchaseOrderFormValues): Promise<PurchaseOrder> {
  if (USE_MOCK) {
    const supplier = mockSuppliers.find((s) => s.id === values.supplierId)
    const items = values.items.map((item, index) => ({
      id: `poi-${Date.now()}-${index}`,
      ...item,
      amount: computeLineAmount(item.quantity, item.unitCost, item.discount, item.tax),
    }))
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)
    const discountTotal = items.reduce((sum, i) => sum + i.discount, 0)
    const taxTotal = items.reduce((sum, i) => sum + i.tax, 0)
    return delay({
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      supplierId: values.supplierId,
      supplierName: supplier?.name ?? "",
      contact: values.contact ?? supplier?.contactPerson ?? "",
      paymentTerms: values.paymentTerms ?? supplier?.paymentTerms ?? "",
      date: new Date().toISOString(),
      deliveryDate: values.deliveryDate,
      status: "draft",
      items,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal: subtotal - discountTotal + taxTotal,
      createdBy: "You",
    })
  }
  const { data } = await apiClient.post<PurchaseOrder>("/purchase/orders", values)
  return data
}

export async function updatePurchaseOrderStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
  if (USE_MOCK) {
    const existing = mockPurchaseOrders.find((o) => o.id === id)
    if (!existing) throw new Error("Purchase order not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<PurchaseOrder>(`/purchase/orders/${id}/status`, { status })
  return data
}

// --- Dashboard / Analytics ---

export async function fetchPurchaseKpis(): Promise<PurchaseKpis> {
  if (USE_MOCK) {
    const totalPurchaseValue = mockPurchaseOrders.reduce((sum, o) => sum + o.grandTotal, 0)
    const pendingOrders = mockPurchaseOrders.filter((o) =>
      ["pending_approval", "approved", "partially_received"].includes(o.status)
    ).length
    const receivedItems = mockPurchaseOrders
      .flatMap((o) => o.items)
      .reduce((sum, i) => sum + i.quantity, 0)
    const outstandingPayments = mockSuppliers.reduce((sum, s) => sum + s.outstanding, 0)
    return delay({ totalPurchaseValue, pendingOrders, receivedItems, outstandingPayments })
  }
  const { data } = await apiClient.get<PurchaseKpis>("/purchase/kpis")
  return data
}

export async function fetchPurchaseTrend(): Promise<PurchaseTrendPoint[]> {
  if (USE_MOCK) return delay(purchaseTrend)
  const { data } = await apiClient.get<PurchaseTrendPoint[]>("/purchase/analytics/trend")
  return data
}

export async function fetchProductCostAnalysis(): Promise<ProductCostPoint[]> {
  if (USE_MOCK) return delay(productCostAnalysis)
  const { data } = await apiClient.get<ProductCostPoint[]>("/purchase/analytics/product-cost")
  return data
}
