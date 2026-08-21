import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { Customer, CustomerAnalytics } from "../types"
import type { CustomerFormValues } from "../schemas/customer.schema"
import { mockCustomerAnalytics, mockCustomers } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

type BackendCustomer = {
  id: string
  companyId: string
  branchId: string | null
  customerCode: string
  name: string
  displayName: string | null
  phone: string | null
  email: string | null
  customerGroupId: string | null
  paymentTermId: string | null
  creditLimit: string
  creditDays: number
  openingBalanceAmount: string
  receivableAccountId: string | null
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

function mapBackendCustomerToCustomer(bc: BackendCustomer): Customer {
  return {
    id: bc.id,
    name: bc.name,
    phone: bc.phone ?? "",
    email: bc.email ?? "",
    country: "Myanmar",
    city: "Yangon",
    address: bc.notes ?? "",
    customerGroup: bc.customerGroupId ?? "Standard",
    loyaltyMember: true,
    memberLevel: "bronze",
    totalOrders: 0,
    totalSpending: 0,
    loyaltyPoints: 0,
    status: bc.status === "ACTIVE" ? "active" : "inactive",
    createdAt: bc.createdAt,
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  if (USE_MOCK) return delay(mockCustomers)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendCustomer[] }>("/customers", {
    params: { companyId },
  })
  return (data.data ?? []).map(mapBackendCustomerToCustomer)
}

export async function fetchCustomerById(id: string): Promise<Customer | undefined> {
  if (USE_MOCK) return delay(mockCustomers.find((c) => c.id === id))
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendCustomer>(`/customers/${id}`, {
    params: { companyId },
  })
  return mapBackendCustomerToCustomer(data)
}

// No `/customers/:id/analytics` (or equivalent) endpoint exists anywhere in
// the backend — confirmed against customers.controller.ts's full route
// table. Genuine BACKEND GAP: returns undefined rather than a hardcoded
// zeroed object that looked identical to real (but empty) data.
export async function fetchCustomerAnalytics(id: string): Promise<CustomerAnalytics | undefined> {
  if (USE_MOCK) return delay(mockCustomerAnalytics[id])
  return undefined
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
  const companyId = await resolveCompanyId()
  // creditLimit/creditDays are intentionally omitted — the form collects no
  // such input, and CreateCustomerDto's own defaults (0/0) are the
  // backend's real answer for "not specified," not the more generous
  // 1000.00/30 this used to hardcode with no basis in either user input or
  // backend defaults.
  const payload = {
    companyId,
    customerCode: `CUST-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    name: values.name,
    phone: values.phone,
    email: values.email,
    openingBalanceAmount: "0.00",
    notes: [values.address, values.city, values.country].filter(Boolean).join(", ") || undefined,
  }
  const { data } = await apiClient.post<BackendCustomer>("/customers", payload)
  return mapBackendCustomerToCustomer(data)
}

export async function updateCustomer(id: string, values: CustomerFormValues): Promise<Customer> {
  if (USE_MOCK) {
    const existing = mockCustomers.find((c) => c.id === id)
    if (!existing) throw new Error("Customer not found")
    return delay({ ...existing, ...values })
  }
  const companyId = await resolveCompanyId()
  const payload = {
    name: values.name,
    phone: values.phone,
    email: values.email,
    notes: [values.address, values.city, values.country].filter(Boolean).join(", ") || undefined,
  }
  const { data } = await apiClient.patch<BackendCustomer>(`/customers/${id}`, payload, {
    params: { companyId },
  })
  return mapBackendCustomerToCustomer(data)
}

export async function deleteCustomer(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/customers/${id}`, { params: { companyId } })
}
