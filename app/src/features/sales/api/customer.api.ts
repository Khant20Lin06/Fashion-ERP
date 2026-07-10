import { apiClient } from "@/lib/api/client"
import type { Customer, CustomerAnalytics } from "../types"
import type { CustomerFormValues } from "../schemas/customer.schema"
import { mockCustomerAnalytics, mockCustomers } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchCustomers(): Promise<Customer[]> {
  if (USE_MOCK) return delay(mockCustomers)
  const { data } = await apiClient.get<Customer[]>("/customers")
  return data
}

export async function fetchCustomerById(id: string): Promise<Customer | undefined> {
  if (USE_MOCK) return delay(mockCustomers.find((c) => c.id === id))
  const { data } = await apiClient.get<Customer>(`/customers/${id}`)
  return data
}

export async function fetchCustomerAnalytics(id: string): Promise<CustomerAnalytics | undefined> {
  if (USE_MOCK) return delay(mockCustomerAnalytics[id])
  const { data } = await apiClient.get<CustomerAnalytics>(`/customers/${id}/analytics`)
  return data
}

export async function createCustomer(values: CustomerFormValues): Promise<Customer> {
  if (USE_MOCK) {
    return delay({
      id: `cust-${Date.now()}`,
      ...values,
      memberLevel: "bronze",
      totalOrders: 0,
      totalSpending: 0,
      loyaltyPoints: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<Customer>("/customers", values)
  return data
}

export async function updateCustomer(id: string, values: CustomerFormValues): Promise<Customer> {
  if (USE_MOCK) {
    const existing = mockCustomers.find((c) => c.id === id)
    if (!existing) throw new Error("Customer not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Customer>(`/customers/${id}`, values)
  return data
}

export async function deleteCustomer(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/customers/${id}`)
}
