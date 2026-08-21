import type { Promotion } from "../types"

const now = Date.now()
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString().slice(0, 10)

export const mockPromotions: Promotion[] = [
  {
    id: "promo-1",
    companyId: "company-mock",
    code: "SUMMER10",
    name: "Summer Sale 10%",
    description: "10% off storewide for the summer season",
    discountType: "PERCENTAGE",
    discountValue: "10.00",
    minimumPurchase: "50.00",
    maximumDiscountAmount: "25.00",
    startDate: daysAgo(20),
    endDate: null,
    usageLimit: 500,
    usageCount: 128,
    status: "ACTIVE",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(5),
  },
  {
    id: "promo-2",
    companyId: "company-mock",
    code: "FLAT5",
    name: "Flat $5 Off",
    description: null,
    discountType: "FIXED_AMOUNT",
    discountValue: "5.00",
    minimumPurchase: "0.00",
    maximumDiscountAmount: null,
    startDate: daysAgo(60),
    endDate: daysAgo(30),
    usageLimit: null,
    usageCount: 340,
    status: "INACTIVE",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(30),
  },
]
