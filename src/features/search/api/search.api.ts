import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"

export type SearchResultType = "product" | "customer" | "invoice" | "supplier"

export type SearchResult = {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  href: string
}

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

const mockIndex: SearchResult[] = [
  { id: "p1", type: "product", title: "Classic Denim Jacket", subtitle: "SKU: DJ-001", href: "/dashboard/products" },
  { id: "p2", type: "product", title: "Floral Summer Dress", subtitle: "SKU: FD-014", href: "/dashboard/products" },
  { id: "c1", type: "customer", title: "Sarah Chen", subtitle: "sarah.chen@email.com", href: "/dashboard/customers" },
  { id: "c2", type: "customer", title: "Marcus Lee", subtitle: "marcus.lee@email.com", href: "/dashboard/customers" },
  { id: "i1", type: "invoice", title: "ORD-10234", subtitle: "$284.50 · Completed", href: "/dashboard/sales" },
  { id: "s1", type: "supplier", title: "Levi's Co.", subtitle: "Denim supplier", href: "/dashboard/purchase" },
]

type BackendProductRow = {
  id: string
  name: string
  code: string
  status: string
}

type BackendCustomerRow = {
  id: string
  name: string
  phone: string | null
  email: string | null
}

type BackendSaleRow = {
  id: string
  invoiceNumber?: string
  totalAmount?: string
  customerName?: string
}

type BackendSupplierRow = {
  id: string
  name: string
  supplierCode?: string
  email?: string | null
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  if (USE_MOCK) {
    return mockIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(normalized) ||
        item.subtitle.toLowerCase().includes(normalized),
    )
  }

  try {
    const companyId = await resolveCompanyId()
    const results: SearchResult[] = []

    const [productsSettled, customersSettled, salesSettled, suppliersSettled] = await Promise.allSettled([
      apiClient.get<{ data: BackendProductRow[] }>("/products", {
        params: { companyId, search: query, limit: 8 },
      }),
      apiClient.get<{ data: BackendCustomerRow[] }>("/customers", {
        params: { companyId, limit: 50 },
      }),
      apiClient.get<{ data: BackendSaleRow[] }>("/sales", {
        params: { companyId, limit: 20 },
      }),
      apiClient.get<{ data: BackendSupplierRow[] }>("/suppliers", {
        params: { companyId, limit: 30 },
      }),
    ])

    // Products
    if (productsSettled.status === "fulfilled" && productsSettled.value.data?.data) {
      for (const p of productsSettled.value.data.data) {
        if (p.name?.toLowerCase().includes(normalized) || p.code?.toLowerCase().includes(normalized)) {
          results.push({
            id: p.id,
            type: "product",
            title: p.name,
            subtitle: `Code: ${p.code}`,
            href: "/dashboard/products",
          })
        }
      }
    }

    // Customers
    if (customersSettled.status === "fulfilled" && customersSettled.value.data?.data) {
      for (const c of customersSettled.value.data.data) {
        const nameMatch = c.name?.toLowerCase().includes(normalized)
        const phoneMatch = c.phone?.toLowerCase().includes(normalized)
        const emailMatch = c.email?.toLowerCase().includes(normalized)
        if (nameMatch || phoneMatch || emailMatch) {
          results.push({
            id: c.id,
            type: "customer",
            title: c.name,
            subtitle: c.phone || c.email || "Customer",
            href: "/dashboard/customers",
          })
        }
      }
    }

    // Sales / Invoices
    if (salesSettled.status === "fulfilled" && salesSettled.value.data?.data) {
      for (const s of salesSettled.value.data.data) {
        const invMatch = s.invoiceNumber?.toLowerCase().includes(normalized)
        const custMatch = s.customerName?.toLowerCase().includes(normalized)
        if (invMatch || custMatch) {
          results.push({
            id: s.id,
            type: "invoice",
            title: s.invoiceNumber || `Order #${s.id.slice(0, 8)}`,
            subtitle: s.totalAmount ? `$${s.totalAmount} · ${s.customerName ?? "Sale"}` : (s.customerName ?? "Sale"),
            href: "/dashboard/sales",
          })
        }
      }
    }

    // Suppliers
    if (suppliersSettled.status === "fulfilled" && suppliersSettled.value.data?.data) {
      for (const sp of suppliersSettled.value.data.data) {
        const nameMatch = sp.name?.toLowerCase().includes(normalized)
        const codeMatch = sp.supplierCode?.toLowerCase().includes(normalized)
        const emailMatch = sp.email?.toLowerCase().includes(normalized)
        if (nameMatch || codeMatch || emailMatch) {
          results.push({
            id: sp.id,
            type: "supplier",
            title: sp.name,
            subtitle: sp.supplierCode ? `Supplier Code: ${sp.supplierCode}` : (sp.email ?? "Supplier"),
            href: "/dashboard/purchase",
          })
        }
      }
    }

    return results
  } catch {
    return []
  }
}
