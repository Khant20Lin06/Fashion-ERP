import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { VariantUomMapping } from "../types"
import type { VariantUomMappingFormValues } from "../schemas/product.schema"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

type BackendVariantUom = {
  id: string
  variantId: string
  companyId: string
  uomId: string
  uomCode: string | null
  uomName: string | null
  conversionFactorToBase: string
  usageType: string
  barcode: string | null
  isBase: boolean
  isActive: boolean
}

function mapVariantUom(mapping: BackendVariantUom): VariantUomMapping {
  return {
    id: mapping.id,
    variantId: mapping.variantId,
    uomId: mapping.uomId,
    uomCode: mapping.uomCode ?? undefined,
    uomName: mapping.uomName ?? undefined,
    conversionFactorToBase: mapping.conversionFactorToBase,
    usageType: mapping.usageType as VariantUomMapping["usageType"],
    barcode: mapping.barcode ?? undefined,
    isBase: mapping.isBase,
    isActive: mapping.isActive,
  }
}

async function requestVariantUomStatus(id: string, endpoint: "activate" | "deactivate", companyId: string) {
  return apiClient.request<BackendVariantUom>({
    url: `/product-variant-uoms/${id}/${endpoint}`,
    method: "POST",
    params: { companyId },
  })
}

export async function fetchVariantUoms(variantId: string): Promise<VariantUomMapping[]> {
  if (USE_MOCK) return delay([])
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendVariantUom[]>(`/product-variants/${variantId}/uoms`, {
    params: { companyId },
  })
  return (data ?? []).map(mapVariantUom)
}

export async function createVariantUom(
  variantId: string,
  values: VariantUomMappingFormValues,
): Promise<VariantUomMapping> {
  if (USE_MOCK) {
    return delay({
      id: `mapping-${Date.now()}`,
      variantId,
      uomId: values.uomId,
      conversionFactorToBase: values.conversionFactorToBase,
      usageType: values.usageType,
      barcode: values.barcode,
      isBase: false,
      isActive: values.isActive,
    })
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendVariantUom>(
    `/product-variants/${variantId}/uoms`,
    {
      uomId: values.uomId,
      conversionFactorToBase: values.conversionFactorToBase,
      usageType: values.usageType,
      barcode: values.barcode || undefined,
    },
    { params: { companyId } },
  )

  let mapping = mapVariantUom(data)
  if (!values.isActive) {
    const statusResponse = await requestVariantUomStatus(mapping.id, "deactivate", companyId)
    mapping = mapVariantUom(statusResponse.data)
  }
  return mapping
}

export async function updateVariantUom(
  id: string,
  values: VariantUomMappingFormValues,
): Promise<VariantUomMapping> {
  if (USE_MOCK) {
    return delay({
      id,
      variantId: "mock-variant",
      uomId: values.uomId,
      conversionFactorToBase: values.conversionFactorToBase,
      usageType: values.usageType,
      barcode: values.barcode,
      isBase: false,
      isActive: values.isActive,
    })
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendVariantUom>(
    `/product-variant-uoms/${id}`,
    {
      conversionFactorToBase: values.conversionFactorToBase,
      usageType: values.usageType,
      barcode: values.barcode || undefined,
      isActive: values.isActive,
    },
    { params: { companyId } },
  )

  let mapping = mapVariantUom(data)
  if (mapping.isActive !== values.isActive) {
    const endpoint = values.isActive ? "activate" : "deactivate"
    const statusResponse = await requestVariantUomStatus(id, endpoint, companyId)
    mapping = mapVariantUom(statusResponse.data)
  }
  return mapping
}

export async function setVariantUomStatus(id: string, isActive: boolean): Promise<VariantUomMapping> {
  if (USE_MOCK) {
    return delay({
      id,
      variantId: "mock-variant",
      uomId: "mock-uom",
      conversionFactorToBase: "1.0000",
      usageType: "BOTH",
      isBase: false,
      isActive,
    })
  }

  const companyId = await resolveCompanyId()
  const endpoint = isActive ? "activate" : "deactivate"
  const { data } = await requestVariantUomStatus(id, endpoint, companyId)
  return mapVariantUom(data)
}

export async function deleteVariantUom(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/product-variant-uoms/${id}`, { params: { companyId } })
}
