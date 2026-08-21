import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { Promotion, PromotionDiscountType, PromotionStatus } from "../types"
import { mockPromotions } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ---------- Backend DTO types (erp-pos fashion api src/modules/promotions) ----------
// Real routes: GET/POST /promotions, GET/PATCH /promotions/:id (NO
// DELETE route exists). permission promotions.read/create/update.
// DataScope-enforced via resolveRequestCompanyId. status is forced to
// ACTIVE server-side on creation (not a CreatePromotionDto field) — the
// only way to change it afterward is PATCH with { status }. code,
// discountType, discountValue, companyId, and startDate are immutable
// after creation (absent from UpdatePromotionDto).

type BackendPromotion = {
  id: string
  companyId: string
  code: string
  name: string
  description: string | null
  discountType: PromotionDiscountType
  discountValue: string
  minimumPurchase: string
  maximumDiscountAmount: string | null
  startDate: string
  endDate: string | null
  usageLimit: number | null
  usageCount: number
  status: PromotionStatus
  createdAt: string
  updatedAt: string
}

function mapPromotion(b: BackendPromotion): Promotion {
  return { ...b }
}

export async function fetchPromotions(): Promise<Promotion[]> {
  if (USE_MOCK) return delay(mockPromotions)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendPromotion[]; meta: unknown }>("/promotions", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapPromotion)
}

export async function fetchPromotionById(id: string): Promise<Promotion | undefined> {
  if (USE_MOCK) return delay(mockPromotions.find((p) => p.id === id))
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendPromotion>(`/promotions/${id}`, { params: { companyId } })
  return mapPromotion(data)
}

export type CreatePromotionInput = {
  code: string
  name: string
  description?: string
  discountType: PromotionDiscountType
  discountValue: string
  minimumPurchase?: string
  maximumDiscountAmount?: string
  startDate: string
  endDate?: string
  usageLimit?: number
}

export async function createPromotion(values: CreatePromotionInput): Promise<Promotion> {
  if (USE_MOCK) {
    return delay({
      id: `promo-${Date.now()}`,
      companyId: "company-mock",
      code: values.code,
      name: values.name,
      description: values.description ?? null,
      discountType: values.discountType,
      discountValue: values.discountValue,
      minimumPurchase: values.minimumPurchase ?? "0.00",
      maximumDiscountAmount: values.maximumDiscountAmount ?? null,
      startDate: values.startDate,
      endDate: values.endDate ?? null,
      usageLimit: values.usageLimit ?? null,
      usageCount: 0,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendPromotion>("/promotions", {
    companyId,
    code: values.code,
    name: values.name,
    description: values.description || undefined,
    discountType: values.discountType,
    discountValue: values.discountValue,
    minimumPurchase: values.minimumPurchase || undefined,
    maximumDiscountAmount: values.maximumDiscountAmount || undefined,
    startDate: values.startDate,
    endDate: values.endDate || undefined,
    usageLimit: values.usageLimit || undefined,
  })
  return mapPromotion(data)
}

// Only the fields the real UpdatePromotionDto accepts — code,
// discountType, discountValue, companyId, and startDate are NOT
// updatable and are intentionally absent from this type.
export type UpdatePromotionInput = {
  name?: string
  description?: string
  minimumPurchase?: string
  maximumDiscountAmount?: string
  endDate?: string
  usageLimit?: number
  status?: PromotionStatus
}

export async function updatePromotion(id: string, values: UpdatePromotionInput): Promise<Promotion> {
  if (USE_MOCK) {
    const existing = mockPromotions.find((p) => p.id === id)
    if (!existing) throw new Error("Promotion not found")
    return delay({ ...existing, ...values })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendPromotion>(`/promotions/${id}`, values, { params: { companyId } })
  return mapPromotion(data)
}
