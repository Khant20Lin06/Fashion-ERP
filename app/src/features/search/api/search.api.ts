export type SearchResultType = "product" | "customer" | "invoice" | "supplier"

export type SearchResult = {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  href: string
}

const mockIndex: SearchResult[] = [
  { id: "p1", type: "product", title: "Classic Denim Jacket", subtitle: "SKU: DJ-001", href: "/dashboard/products" },
  { id: "p2", type: "product", title: "Floral Summer Dress", subtitle: "SKU: FD-014", href: "/dashboard/products" },
  { id: "c1", type: "customer", title: "Sarah Chen", subtitle: "sarah.chen@email.com", href: "/dashboard/customers" },
  { id: "c2", type: "customer", title: "Marcus Lee", subtitle: "marcus.lee@email.com", href: "/dashboard/customers" },
  { id: "i1", type: "invoice", title: "ORD-10234", subtitle: "$284.50 · Completed", href: "/dashboard/sales/invoices" },
  { id: "s1", type: "supplier", title: "Levi's Co.", subtitle: "Denim supplier", href: "/dashboard/purchase" },
]

/**
 * Client-side mock search — swap for a real /search?q= API call once the
 * backend provides one. Kept synchronous-but-async-shaped so callers don't
 * need to change when a real network call replaces this.
 */
export async function searchGlobal(query: string): Promise<SearchResult[]> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return mockIndex.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.subtitle.toLowerCase().includes(normalized)
  )
}
