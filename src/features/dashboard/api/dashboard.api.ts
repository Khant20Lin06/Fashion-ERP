import { apiClient } from "@/lib/api/client"
import type { DashboardSummary, SalesTrendGranularity } from "../types"
import { getMockDashboardSummary } from "./mock-data"

/**
 * Fetches the full dashboard summary. Falls back to local mock data when
 * NEXT_PUBLIC_USE_MOCK_AUTH is enabled (same dev-mode flag used by the auth
 * module in Phase 1) so the UI is fully demonstrable before a real ERP
 * backend/reporting API exists. Swap this for a real apiClient.get call
 * once /reports/dashboard-summary is available.
 */
export async function fetchDashboardSummary(
  granularity: SalesTrendGranularity = "monthly"
): Promise<DashboardSummary> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true") {
    return getMockDashboardSummary(granularity)
  }

  const { data } = await apiClient.get<DashboardSummary>("/reports/dashboard-summary", {
    params: { granularity },
  })
  return data
}
