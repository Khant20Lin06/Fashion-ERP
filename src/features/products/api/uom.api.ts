import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { Uom } from "../types"
import type { UomFormValues } from "../schemas/product.schema"
import { mockUoms } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

type BackendUom = {
  id: string
  companyId: string
  code: string
  name: string
  symbol: string | null
  category: string
  decimalPlaces: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function mapUom(uom: BackendUom): Uom {
  return {
    id: uom.id,
    code: uom.code,
    name: uom.name,
    symbol: uom.symbol ?? undefined,
    category: uom.category as Uom["category"],
    decimalPlaces: uom.decimalPlaces,
    isActive: uom.isActive,
  }
}

async function requestUomStatus(id: string, endpoint: "activate" | "deactivate", companyId: string) {
  return apiClient.request<BackendUom>({
    url: `/uoms/${id}/${endpoint}`,
    method: "POST",
    params: { companyId },
  })
}

export async function fetchUoms(): Promise<Uom[]> {
  if (USE_MOCK) return delay(mockUoms)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendUom[] }>("/uoms", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapUom)
}

export async function createUom(values: UomFormValues): Promise<Uom> {
  if (USE_MOCK) {
    return delay({
      id: `uom-${Date.now()}`,
      code: values.code,
      name: values.name,
      symbol: values.symbol,
      category: values.category,
      decimalPlaces: values.decimalPlaces,
      isActive: values.isActive,
    })
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendUom>("/uoms", {
    companyId,
    code: values.code,
    name: values.name,
    symbol: values.symbol || undefined,
    category: values.category,
    decimalPlaces: values.decimalPlaces,
  })

  let uom = mapUom(data)
  if (!values.isActive) {
    const statusResponse = await requestUomStatus(uom.id, "deactivate", companyId)
    uom = mapUom(statusResponse.data)
  }
  return uom
}

export async function updateUom(id: string, values: UomFormValues): Promise<Uom> {
  if (USE_MOCK) {
    const existing = mockUoms.find((uom) => uom.id === id)
    if (!existing) throw new Error("UOM not found")
    return delay({
      ...existing,
      code: values.code,
      name: values.name,
      symbol: values.symbol,
      category: values.category,
      decimalPlaces: values.decimalPlaces,
      isActive: values.isActive,
    })
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendUom>(
    `/uoms/${id}`,
    {
      code: values.code,
      name: values.name,
      symbol: values.symbol || undefined,
      category: values.category,
      decimalPlaces: values.decimalPlaces,
    },
    { params: { companyId } },
  )

  let uom = mapUom(data)
  if (uom.isActive !== values.isActive) {
    const endpoint = values.isActive ? "activate" : "deactivate"
    const statusResponse = await requestUomStatus(id, endpoint, companyId)
    uom = mapUom(statusResponse.data)
  }
  return uom
}

export async function setUomStatus(id: string, isActive: boolean): Promise<Uom> {
  if (USE_MOCK) {
    const existing = mockUoms.find((uom) => uom.id === id)
    if (!existing) throw new Error("UOM not found")
    return delay({ ...existing, isActive })
  }

  const companyId = await resolveCompanyId()
  const endpoint = isActive ? "activate" : "deactivate"
  const { data } = await requestUomStatus(id, endpoint, companyId)
  return mapUom(data)
}

export async function deleteUom(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/uoms/${id}`, { params: { companyId } })
}
