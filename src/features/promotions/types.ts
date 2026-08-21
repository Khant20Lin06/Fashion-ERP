/** Core domain types for Promotion Management.
 * Mirrors the real backend contract exactly (erp-pos fashion api
 * src/modules/promotions) — confirmed via direct controller/DTO reads
 * during the Phase 22 audit. There is no delete/activate/deactivate
 * route — status only ever changes via PATCH /promotions/:id with a
 * `status` field, and code/discountType/discountValue/startDate are
 * immutable after creation.
 */

export type PromotionDiscountType = "PERCENTAGE" | "FIXED_AMOUNT"
export type PromotionStatus = "ACTIVE" | "INACTIVE"

export type Promotion = {
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
