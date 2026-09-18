import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { OnlineOrder, OnlineOrderStatus } from "../types"
import { mockSalesOrders, mockCustomers } from "@/features/sales/api/mock-data"
import type { SalesOrder } from "@/features/sales/types"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const mockOnlineOrders: OnlineOrder[] = [
  {
    id: "oo-1",
    companyId: "comp-1",
    saleId: mockSalesOrders[0]?.id || "so-1",
    customerId: mockCustomers[0]?.id || "cust-1",
    source: "TELEGRAM",
    status: "PENDING_REVIEW",
    telegramUserId: "123456789",
    telegramUsername: "@johndoe",
    deliveryAddress: "123 Main St, Yangon",
    statusUpdatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sale: mockSalesOrders[0],
    customerName: mockCustomers[0]?.name || "John Doe",
    customerPhone: mockCustomers[0]?.phone || "09123456789",
  },
  {
    id: "oo-2",
    companyId: "comp-1",
    saleId: mockSalesOrders[1]?.id || "so-2",
    customerId: mockCustomers[1]?.id || "cust-2",
    source: "TELEGRAM",
    status: "CONFIRMED",
    telegramUserId: "987654321",
    telegramUsername: "@janedoe",
    deliveryAddress: "456 Park Ave, Mandalay",
    statusUpdatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sale: mockSalesOrders[1],
    customerName: mockCustomers[1]?.name || "Jane Doe",
    customerPhone: mockCustomers[1]?.phone || "09876543210",
  }
]

export async function fetchOnlineOrders(companyId?: string): Promise<OnlineOrder[]> {
  if (USE_MOCK) return delay(mockOnlineOrders)

  const resolvedCompanyId = await resolveCompanyId(companyId)
  
  // Real API fetching would join sale and customer data or we fetch them separately
  // For now, we assume the backend returns the OnlineOrder with joined relations or we'd do Promise.all
  const { data } = await apiClient.get<{ data: OnlineOrder[] }>("/online-orders", {
    params: { companyId: resolvedCompanyId, limit: 100 },
  })

  // To simulate joining if the backend doesn't return it:
  // In a real implementation, you'd fetch the linked sales & customers and merge them.
  return data.data ?? []
}

export async function fetchOnlineOrderById(id: string, companyId?: string): Promise<OnlineOrder | undefined> {
  if (USE_MOCK) return delay(mockOnlineOrders.find((o) => o.id === id))
  
  const resolvedCompanyId = await resolveCompanyId(companyId)
  const { data } = await apiClient.get<OnlineOrder>(`/online-orders/${id}`, {
    params: { companyId: resolvedCompanyId },
  })
  
  return data
}

export async function updateOnlineOrderStatus(id: string, status: OnlineOrderStatus, companyId?: string): Promise<OnlineOrder> {
  if (USE_MOCK) {
    const existing = mockOnlineOrders.find((o) => o.id === id)
    if (!existing) throw new Error("Online order not found")
    return delay({ ...existing, status, statusUpdatedAt: new Date().toISOString() })
  }
  
  const resolvedCompanyId = await resolveCompanyId(companyId)
  const { data } = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/status`, { status }, {
    params: { companyId: resolvedCompanyId },
  })
  
  return data
}

export async function dispatchOnlineOrder(
  id: string,
  payload: {
    courierService: string
    trackingNumber?: string
    codAmount?: string
    riderName?: string
    riderPhone?: string
  },
  companyId?: string,
): Promise<OnlineOrder> {
  const resolvedCompanyId = await resolveCompanyId(companyId)
  const { data } = await apiClient.post<OnlineOrder>(`/online-orders/${id}/dispatch`, payload, {
    params: { companyId: resolvedCompanyId },
  })
  return data
}

export async function settleOnlineOrderCod(
  id: string,
  payload: {
    collectedAmount: string
    notes?: string
  },
  companyId?: string,
): Promise<OnlineOrder> {
  const resolvedCompanyId = await resolveCompanyId(companyId)
  const { data } = await apiClient.post<OnlineOrder>(`/online-orders/${id}/settle-cod`, payload, {
    params: { companyId: resolvedCompanyId },
  })
  return data
}
