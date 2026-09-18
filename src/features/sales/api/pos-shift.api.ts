import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { PosShift } from "../types"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

let mockCurrentShift: PosShift | null = null

export async function fetchCurrentShift(branchId?: string): Promise<PosShift | null> {
  if (USE_MOCK) return mockCurrentShift
  try {
    const companyId = await resolveCompanyId()
    const { data } = await apiClient.get<PosShift | null>("/pos/shifts/current", {
      params: { companyId, branchId },
    })
    return data ?? null
  } catch (error) {
    console.error("Error fetching current shift:", error)
    return null
  }
}

export async function openShift(payload: {
  branchId: string
  openingCash?: string
  notes?: string
}): Promise<PosShift> {
  if (USE_MOCK) {
    mockCurrentShift = {
      id: `shift-${Date.now()}`,
      companyId: "mock-company",
      branchId: payload.branchId,
      cashierId: "mock-cashier",
      shiftNumber: `SH-${Date.now().toString().slice(-6)}`,
      status: "OPEN",
      openedAt: new Date().toISOString(),
      closedAt: null,
      openingCash: payload.openingCash || "0.00",
      expectedCash: payload.openingCash || "0.00",
      actualCash: null,
      cashDifference: null,
      totalSalesAmount: "0.00",
      totalSalesCount: 0,
      totalReturnsAmount: "0.00",
      paymentSummary: null,
      notes: payload.notes || null,
      cashier: {
        id: "mock-cashier",
        displayName: "Cashier Staff",
        email: "staff@fashionerp.com",
      },
    }
    return mockCurrentShift
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<PosShift>("/pos/shifts/open", payload, {
    params: { companyId },
  })
  return data
}

export async function closeShift(
  shiftId: string,
  payload: {
    actualCash: string
    notes?: string
  },
): Promise<PosShift> {
  if (USE_MOCK) {
    if (mockCurrentShift) {
      mockCurrentShift.status = "CLOSED"
      mockCurrentShift.closedAt = new Date().toISOString()
      mockCurrentShift.actualCash = payload.actualCash
      const expected = parseFloat(mockCurrentShift.expectedCash)
      const actual = parseFloat(payload.actualCash)
      mockCurrentShift.cashDifference = (actual - expected).toFixed(2)
      const closed = { ...mockCurrentShift }
      mockCurrentShift = null
      return closed
    }
  }

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<PosShift>(`/pos/shifts/${shiftId}/close`, payload, {
    params: { companyId },
  })
  return data
}

export async function fetchShiftHistory(
  branchId?: string,
  limit = 20,
): Promise<PosShift[]> {
  if (USE_MOCK) return mockCurrentShift ? [mockCurrentShift] : []
  try {
    const companyId = await resolveCompanyId()
    const { data } = await apiClient.get<PosShift[]>("/pos/shifts", {
      params: { companyId, branchId, limit },
    })
    return data ?? []
  } catch (error) {
    console.error("Error fetching shift history:", error)
    return []
  }
}
