import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { Brand, Collection } from "../types"
import type { BrandFormValues } from "../schemas/product.schema"
import { mockBrands, mockCollections } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function buildMockCode(prefix: "BR", name: string, providedCode?: string) {
  if (providedCode?.trim()) {
    return providedCode.trim().toUpperCase()
  }
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "ITEM"
  return `${prefix}-${slug}`.slice(0, 50).replace(/-+$/g, "")
}

type BackendBrand = {
  id: string
  companyId: string
  code: string
  name: string
  description: string | null
  country: string | null
  status: string
  productCount?: number
}

type BackendCollection = {
  id: string
  companyId: string
  code: string
  name: string
  status: string
}

function mapBrand(bb: BackendBrand): Brand {
  return {
    id: bb.id,
    code: bb.code,
    name: bb.name,
    isActive: bb.status === "ACTIVE",
    productCount: bb.productCount ?? 0,
    country: bb.country ?? undefined,
    description: bb.description ?? undefined,
  }
}

async function requestBrandStatus(id: string, endpoint: "activate" | "deactivate", companyId: string) {
  return apiClient.request<BackendBrand>({
    url: `/brands/${id}/${endpoint}`,
    method: "POST",
    params: { companyId },
  })
}

function mapCollection(bc: BackendCollection): Collection {
  return {
    id: bc.id,
    name: bc.name,
    season: "all_season",
    year: 2026,
    isActive: bc.status === "ACTIVE",
    productCount: 0,
  }
}

export async function fetchBrands(): Promise<Brand[]> {
  if (USE_MOCK) return delay(mockBrands)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendBrand[] }>("/brands", {
    params: { companyId },
  })
  return (data.data ?? []).map(mapBrand)
}

export async function createBrand(values: BrandFormValues): Promise<Brand> {
  if (USE_MOCK) {
    return delay({
      id: `brand-${Date.now()}`,
      code: buildMockCode("BR", values.name, values.code),
      name: values.name,
      country: values.country,
      description: values.description,
      isActive: values.isActive,
      productCount: 0,
    })
  }
  const companyId = await resolveCompanyId()
  const payload = {
    companyId,
    name: values.name,
    description: values.description,
    country: values.country,
    ...(values.code ? { code: values.code } : {}),
  }
  const { data } = await apiClient.post<BackendBrand>("/brands", payload)
  let brand = mapBrand(data)
  if (!values.isActive) {
    const statusResponse = await requestBrandStatus(brand.id, "deactivate", companyId)
    brand = mapBrand(statusResponse.data)
  }
  return brand
}

export async function updateBrand(id: string, values: BrandFormValues): Promise<Brand> {
  if (USE_MOCK) {
    const existing = mockBrands.find((b) => b.id === id)
    if (!existing) throw new Error("Brand not found")
    return delay({ ...existing, ...values })
  }
  const companyId = await resolveCompanyId()
  const payload = {
    name: values.name,
    description: values.description,
    country: values.country,
  }
  const { data } = await apiClient.patch<BackendBrand>(`/brands/${id}`, payload, {
    params: { companyId },
  })
  let brand = mapBrand(data)
  if (brand.isActive !== values.isActive) {
    const endpoint = values.isActive ? "activate" : "deactivate"
    const statusResponse = await requestBrandStatus(id, endpoint, companyId)
    brand = mapBrand(statusResponse.data)
  }
  return brand
}

export async function deleteBrand(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/brands/${id}`, { params: { companyId } })
}

export async function fetchCollections(): Promise<Collection[]> {
  if (USE_MOCK) return delay(mockCollections)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendCollection[] }>("/collections", {
    params: { companyId },
  })
  return (data.data ?? []).map(mapCollection)
}
