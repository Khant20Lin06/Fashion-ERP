import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { resolveCompanyCurrency } from "@/lib/api/resolve-company-currency"
import { mockProducts, mockUoms } from "./mock-data"
import { collectPaginatedRows, type PaginatedRowsMeta } from "./collect-paginated-rows"
import { clampPriceListItemsLimit } from "./price-list-query-limit"
import type { PriceList, PriceListItem } from "../types"
import type { PriceListFormValues, PriceListItemFormValues } from "../schemas/product.schema"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

type BackendPriceList = {
  id: string
  companyId: string
  code: string
  name: string
  description: string | null
  currency: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  updatedAt: string
}

type BackendPriceListItem = {
  id: string
  priceListId: string
  productVariantId: string
  companyId: string
  uomId: string | null
  price: string
  validFrom: string
  validTo: string | null
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  updatedAt: string
}

type PaginatedPriceListItemsResponse = {
  data: BackendPriceListItem[]
  meta?: PaginatedRowsMeta
}

const mockCompanyId = "mock-company"
const nowIso = new Date().toISOString()

let mockPriceLists: PriceList[] = [
  {
    id: "price-list-retail",
    companyId: mockCompanyId,
    code: "RETAIL",
    name: "Retail Selling Price",
    description: "Default store selling price list for day-to-day sales.",
    currency: "USD",
    status: "ACTIVE",
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "price-list-wholesale",
    companyId: mockCompanyId,
    code: "WHOLESALE",
    name: "Wholesale Price List",
    description: "Volume and pack-based selling prices for wholesale customers.",
    currency: "USD",
    status: "ACTIVE",
    createdAt: nowIso,
    updatedAt: nowIso,
  },
]

let mockPriceListItems: PriceListItem[] = [
  {
    id: "pli-retail-1",
    priceListId: "price-list-retail",
    productVariantId: "var-2",
    companyId: mockCompanyId,
    uomId: "uom-pcs",
    price: 35,
    validFrom: "2026-01-01T00:00:00.000Z",
    status: "ACTIVE",
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "pli-wholesale-1",
    priceListId: "price-list-wholesale",
    productVariantId: "var-2",
    companyId: mockCompanyId,
    uomId: "uom-box",
    price: 399,
    validFrom: "2026-01-01T00:00:00.000Z",
    status: "ACTIVE",
    createdAt: nowIso,
    updatedAt: nowIso,
  },
]

function mapPriceList(entry: BackendPriceList): PriceList {
  return {
    id: entry.id,
    companyId: entry.companyId,
    code: entry.code,
    name: entry.name,
    description: entry.description ?? undefined,
    currency: entry.currency,
    status: entry.status,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }
}

function mapPriceListItem(entry: BackendPriceListItem): PriceListItem {
  return {
    id: entry.id,
    priceListId: entry.priceListId,
    productVariantId: entry.productVariantId,
    companyId: entry.companyId,
    uomId: entry.uomId ?? undefined,
    price: Number(entry.price),
    validFrom: entry.validFrom,
    validTo: entry.validTo ?? undefined,
    status: entry.status,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }
}

async function requestPriceListStatus(id: string, endpoint: "activate" | "deactivate", companyId: string) {
  return apiClient.request<BackendPriceList>({
    url: `/price-lists/${id}/${endpoint}`,
    method: "POST",
    params: { companyId },
  })
}

async function requestPriceListItemDeactivate(priceListId: string, id: string, companyId: string) {
  return apiClient.request<BackendPriceListItem>({
    url: `/price-lists/${priceListId}/items/${id}/deactivate`,
    method: "POST",
    params: { companyId },
  })
}

function clonePriceList<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export async function fetchPriceLists(): Promise<PriceList[]> {
  if (USE_MOCK) {
    return delay(clonePriceList(mockPriceLists).sort((a, b) => a.name.localeCompare(b.name)))
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendPriceList[] }>("/price-lists", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapPriceList)
}

export async function createPriceList(values: PriceListFormValues): Promise<PriceList> {
  if (USE_MOCK) {
    const created: PriceList = {
      id: `price-list-${Date.now()}`,
      companyId: mockCompanyId,
      code: values.code,
      name: values.name,
      description: values.description,
      currency: values.currency,
      status: values.isActive ? "ACTIVE" : "INACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockPriceLists = [created, ...mockPriceLists]
    return delay(clonePriceList(created))
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPriceList>("/price-lists", {
    companyId,
    code: values.code,
    name: values.name,
    description: values.description || undefined,
    currency: values.currency,
  })

  let created = mapPriceList(data)
  if (!values.isActive) {
    const response = await requestPriceListStatus(created.id, "deactivate", companyId)
    created = mapPriceList(response.data)
  }
  return created
}

export async function updatePriceList(id: string, values: PriceListFormValues): Promise<PriceList> {
  if (USE_MOCK) {
    const existing = mockPriceLists.find((entry) => entry.id === id)
    if (!existing) throw new Error("Price list not found")
    const updated: PriceList = {
      ...existing,
      name: values.name,
      description: values.description,
      status: values.isActive ? "ACTIVE" : "INACTIVE",
      updatedAt: new Date().toISOString(),
    }
    mockPriceLists = mockPriceLists.map((entry) => (entry.id === id ? updated : entry))
    return delay(clonePriceList(updated))
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendPriceList>(
    `/price-lists/${id}`,
    {
      name: values.name,
      description: values.description || undefined,
    },
    { params: { companyId } },
  )

  let updated = mapPriceList(data)
  const shouldActivate = values.isActive
  if ((updated.status === "ACTIVE") !== shouldActivate) {
    const response = await requestPriceListStatus(id, shouldActivate ? "activate" : "deactivate", companyId)
    updated = mapPriceList(response.data)
  }
  return updated
}

export async function setPriceListStatus(id: string, isActive: boolean): Promise<PriceList> {
  if (USE_MOCK) {
    const existing = mockPriceLists.find((entry) => entry.id === id)
    if (!existing) throw new Error("Price list not found")
    const updated = {
      ...existing,
      status: isActive ? "ACTIVE" : "INACTIVE",
      updatedAt: new Date().toISOString(),
    } satisfies PriceList
    mockPriceLists = mockPriceLists.map((entry) => (entry.id === id ? updated : entry))
    return delay(clonePriceList(updated))
  }

  const companyId = await resolveCompanyId()
  const response = await requestPriceListStatus(id, isActive ? "activate" : "deactivate", companyId)
  return mapPriceList(response.data)
}

export async function deletePriceList(id: string): Promise<void> {
  if (USE_MOCK) {
    mockPriceLists = mockPriceLists.filter((entry) => entry.id !== id)
    mockPriceListItems = mockPriceListItems.filter((entry) => entry.priceListId !== id)
    return delay(undefined)
  }

  const companyId = await resolveCompanyId()
  await apiClient.delete(`/price-lists/${id}`, { params: { companyId } })
}

export async function fetchPriceListItems(priceListId: string): Promise<PriceListItem[]> {
  return fetchPriceListItemsByFilter(priceListId)
}

export async function fetchPriceListItemsByFilter(
  priceListId: string,
  filters?: {
    productVariantId?: string
    uomId?: string
    limit?: number
  },
): Promise<PriceListItem[]> {
  if (USE_MOCK) {
    return delay(
      clonePriceList(
        mockPriceListItems
          .filter((entry) => entry.priceListId === priceListId)
          .filter((entry) => (filters?.productVariantId ? entry.productVariantId === filters.productVariantId : true))
          .filter((entry) => (filters?.uomId !== undefined ? entry.uomId === filters.uomId : true))
          .sort((a, b) => b.validFrom.localeCompare(a.validFrom)),
      ),
    )
  }

  const companyId = await resolveCompanyId()
  const limit = clampPriceListItemsLimit(filters?.limit)
  const rows = await collectPaginatedRows<PriceListItem>({
    limit,
    keyOf: (item) => item.id,
    fetchPage: async (page, pageLimit) => {
      const { data } = await apiClient.get<PaginatedPriceListItemsResponse>(`/price-lists/${priceListId}/items`, {
        params: {
          companyId,
          page,
          limit: pageLimit,
          productVariantId: filters?.productVariantId,
          uomId: filters?.uomId,
        },
      })

      return {
        rows: (data.data ?? []).map(mapPriceListItem),
        meta: data.meta,
      }
    },
  })

  return rows
}

export async function createPriceListItem(
  priceListId: string,
  values: PriceListItemFormValues,
): Promise<PriceListItem> {
  if (USE_MOCK) {
    const created: PriceListItem = {
      id: `pli-${Date.now()}`,
      priceListId,
      productVariantId: values.productVariantId,
      companyId: mockCompanyId,
      uomId: values.uomId,
      price: Number(values.price),
      validFrom: new Date(values.validFrom).toISOString(),
      validTo: values.validTo ? new Date(values.validTo).toISOString() : undefined,
      status: values.isActive ? "ACTIVE" : "INACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockPriceListItems = [created, ...mockPriceListItems]
    return delay(clonePriceList(created))
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPriceListItem>(
    `/price-lists/${priceListId}/items`,
    {
      productVariantId: values.productVariantId,
      uomId: values.uomId,
      price: values.price,
      validFrom: new Date(values.validFrom).toISOString(),
      validTo: values.validTo ? new Date(values.validTo).toISOString() : undefined,
    },
    { params: { companyId } },
  )

  let created = mapPriceListItem(data)
  if (!values.isActive) {
    const response = await requestPriceListItemDeactivate(priceListId, created.id, companyId)
    created = mapPriceListItem(response.data)
  }
  return created
}

export async function updatePriceListItem(
  priceListId: string,
  id: string,
  values: PriceListItemFormValues,
): Promise<PriceListItem> {
  if (USE_MOCK) {
    const existing = mockPriceListItems.find((entry) => entry.id === id)
    if (!existing) throw new Error("Price list item not found")
    const updated: PriceListItem = {
      ...existing,
      price: Number(values.price),
      validTo: values.validTo ? new Date(values.validTo).toISOString() : undefined,
      status: values.isActive ? "ACTIVE" : "INACTIVE",
      updatedAt: new Date().toISOString(),
    }
    mockPriceListItems = mockPriceListItems.map((entry) => (entry.id === id ? updated : entry))
    return delay(clonePriceList(updated))
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendPriceListItem>(
    `/price-lists/${priceListId}/items/${id}`,
    {
      price: values.price,
      validTo: values.validTo ? new Date(values.validTo).toISOString() : undefined,
    },
    { params: { companyId } },
  )

  let updated = mapPriceListItem(data)
  if ((updated.status === "ACTIVE") !== values.isActive) {
    if (values.isActive) {
      // Backend exposes only deactivate on item history rows, so reactivation
      // is intentionally not supported from this workflow.
      throw new Error("Inactive price rows cannot be reactivated. Create a new effective-dated row instead.")
    }
    const response = await requestPriceListItemDeactivate(priceListId, id, companyId)
    updated = mapPriceListItem(response.data)
  }
  return updated
}

export async function deactivatePriceListItem(priceListId: string, id: string): Promise<PriceListItem> {
  if (USE_MOCK) {
    const existing = mockPriceListItems.find((entry) => entry.id === id)
    if (!existing) throw new Error("Price list item not found")
    const updated = {
      ...existing,
      status: "INACTIVE",
      updatedAt: new Date().toISOString(),
    } satisfies PriceListItem
    mockPriceListItems = mockPriceListItems.map((entry) => (entry.id === id ? updated : entry))
    return delay(clonePriceList(updated))
  }

  const companyId = await resolveCompanyId()
  const response = await requestPriceListItemDeactivate(priceListId, id, companyId)
  return mapPriceListItem(response.data)
}

export async function deletePriceListItem(priceListId: string, id: string): Promise<void> {
  if (USE_MOCK) {
    mockPriceListItems = mockPriceListItems.filter((entry) => entry.id !== id)
    return delay(undefined)
  }

  const companyId = await resolveCompanyId()
  await apiClient.delete(`/price-lists/${priceListId}/items/${id}`, { params: { companyId } })
}

export async function createDefaultMockPriceListIfMissing(): Promise<void> {
  if (!USE_MOCK) return
  if (mockPriceLists.length > 0) return

  const currency = await resolveCompanyCurrency(mockCompanyId).catch(() => "USD")
  mockPriceLists = [
    {
      id: `price-list-${Date.now()}`,
      companyId: mockCompanyId,
      code: "DEFAULT",
      name: "Default Selling Price",
      description: "Auto-generated default price list.",
      currency,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

export function findMockVariantById(variantId: string) {
  return mockProducts.flatMap((product) => product.variants).find((variant) => variant.id === variantId)
}

export function findMockUomById(uomId: string | undefined) {
  return mockUoms.find((uom) => uom.id === uomId)
}
