import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { AttributeKind, AttributeOption } from "../types"
import type { AttributeOptionFormValues } from "../schemas/product.schema"
import { attributeOptions } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

type BackendAttributeOption = {
  id: string
  companyId: string
  code: string
  kind: string
  value: string
  swatch: string | null
  sortOrder: number
  status: string
}

function mapAttributeOption(ba: BackendAttributeOption): AttributeOption {
  return {
    id: ba.id,
    kind: ba.kind.toLowerCase() as AttributeKind,
    code: ba.code,
    value: ba.value,
    swatch: ba.swatch ?? undefined,
    isActive: ba.status === "ACTIVE",
  }
}

async function requestAttributeOptionStatus(
  id: string,
  endpoint: "activate" | "deactivate",
  companyId: string
) {
  return apiClient.request<BackendAttributeOption>({
    url: `/attribute-options/${id}/${endpoint}`,
    method: "POST",
    params: { companyId },
  })
}

export async function fetchAttributeOptions(kind: AttributeKind): Promise<AttributeOption[]> {
  if (USE_MOCK) return delay(attributeOptions.filter((option) => option.kind === kind))
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendAttributeOption[] }>("/attribute-options", {
    params: { companyId, kind: kind.toUpperCase() }
  })
  return (data.data ?? []).map(mapAttributeOption)
}

export async function createAttributeOption(kind: AttributeKind, values: AttributeOptionFormValues): Promise<AttributeOption> {
  if (USE_MOCK) {
    return delay({
      id: `${kind}-${Date.now()}`,
      kind,
      code: `ATTR-${kind.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      value: values.value,
      swatch: values.swatch,
      isActive: true,
    })
  }
  const companyId = await resolveCompanyId()
  const payload = {
    companyId,
    code: `ATTR-${kind.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
    kind: kind.toUpperCase(),
    value: values.value,
    ...(values.swatch ? { swatch: values.swatch } : {}),
  }
  const { data } = await apiClient.post<BackendAttributeOption>("/attribute-options", payload)
  return mapAttributeOption(data)
}

export async function updateAttributeOption(id: string, values: AttributeOptionFormValues): Promise<AttributeOption> {
  if (USE_MOCK) {
    const existing = attributeOptions.find((option) => option.id === id)
    if (!existing) throw new Error("Attribute option not found")
    return delay({ ...existing, ...values })
  }
  const companyId = await resolveCompanyId()
  const payload = {
    value: values.value,
    ...(values.swatch ? { swatch: values.swatch } : {}),
  }
  const { data } = await apiClient.patch<BackendAttributeOption>(`/attribute-options/${id}`, payload, {
    params: { companyId },
  })
  return mapAttributeOption(data)
}

export async function setAttributeOptionStatus(id: string, isActive: boolean): Promise<AttributeOption> {
  if (USE_MOCK) {
    const existing = attributeOptions.find((option) => option.id === id)
    if (!existing) throw new Error("Attribute option not found")
    return delay({ ...existing, isActive })
  }
  const companyId = await resolveCompanyId()
  const endpoint = isActive ? "activate" : "deactivate"
  const { data } = await requestAttributeOptionStatus(id, endpoint, companyId)
  return mapAttributeOption(data)
}

export async function deleteAttributeOption(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/attribute-options/${id}`, { params: { companyId } })
}
