import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { Category } from "../types"
import type { CategoryFormValues } from "../schemas/product.schema"
import { mockCategories } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function buildMockCode(prefix: "CAT", name: string, providedCode?: string) {
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

type BackendCategory = {
  id: string
  companyId: string
  code: string
  name: string
  description: string | null
  parentId: string | null
  status: string
  sortOrder: number
  productCount?: number
}

function mapCategory(bc: BackendCategory): Category {
  return {
    id: bc.id,
    code: bc.code,
    name: bc.name,
    parentId: bc.parentId,
    isActive: bc.status === "ACTIVE",
    productCount: bc.productCount ?? 0,
  }
}

async function requestCategoryStatus(id: string, endpoint: "activate" | "deactivate", companyId: string) {
  return apiClient.request<BackendCategory>({
    url: `/categories/${id}/${endpoint}`,
    method: "POST",
    params: { companyId },
  })
}

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) return delay(mockCategories)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendCategory[]; meta: unknown }>("/categories", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapCategory)
}

export async function createCategory(values: CategoryFormValues): Promise<Category> {
  if (USE_MOCK) {
    return delay({
      id: `cat-${Date.now()}`,
      code: buildMockCode("CAT", values.name, values.code),
      name: values.name,
      parentId: values.parentId,
      isActive: values.isActive,
      productCount: 0,
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendCategory>("/categories", {
    name: values.name,
    parentId: values.parentId,
    companyId,
    ...(values.code ? { code: values.code } : {}),
  })
  let category = mapCategory(data)
  if (!values.isActive) {
    const statusResponse = await requestCategoryStatus(category.id, "deactivate", companyId)
    category = mapCategory(statusResponse.data)
  }
  return category
}

export async function updateCategory(id: string, values: CategoryFormValues): Promise<Category> {
  if (USE_MOCK) {
    const existing = mockCategories.find((c) => c.id === id)
    if (!existing) throw new Error("Category not found")
    return delay({
      ...existing,
      name: values.name,
      parentId: values.parentId,
      isActive: values.isActive,
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendCategory>(
    `/categories/${id}`,
    {
      name: values.name,
      parentId: values.parentId,
    },
    {
      params: { companyId },
    }
  )
  let category = mapCategory(data)
  if (category.isActive !== values.isActive) {
    const endpoint = values.isActive ? "activate" : "deactivate"
    const statusResponse = await requestCategoryStatus(id, endpoint, companyId)
    category = mapCategory(statusResponse.data)
  }
  return category
}

export async function setCategoryStatus(id: string, isActive: boolean): Promise<Category> {
  if (USE_MOCK) {
    const existing = mockCategories.find((c) => c.id === id)
    if (!existing) throw new Error("Category not found")
    return delay({ ...existing, isActive })
  }
  const companyId = await resolveCompanyId()
  const endpoint = isActive ? "activate" : "deactivate"
  const { data } = await requestCategoryStatus(id, endpoint, companyId)
  return mapCategory(data)
}

export async function deleteCategory(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/categories/${id}`, { params: { companyId } })
}
