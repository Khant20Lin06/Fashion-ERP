"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchDashboardSummary } from "../api/dashboard.api"
import type { SalesTrendGranularity } from "../types"

export function useDashboardSummary(granularity: SalesTrendGranularity = "monthly") {
  return useQuery({
    queryKey: ["dashboard-summary", granularity],
    queryFn: () => fetchDashboardSummary(granularity),
    staleTime: 60 * 1000,
  })
}
