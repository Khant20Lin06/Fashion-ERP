"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useDashboardSummary } from "../hooks/use-dashboard-summary"
import { getVisibleWidgets, getVisibleKpiIds } from "../config/widget-visibility"
import { DashboardGreeting } from "./DashboardGreeting"
import { KPISection } from "./KPISection"
import { SalesOverview } from "./SalesOverview"
import { RevenueChartWidget } from "./RevenueChart"
import { InventoryStatus } from "./InventoryStatus"
import { RecentOrders } from "./RecentOrders"
import { TopProducts } from "./TopProducts"
import { LowStockAlert } from "./LowStockAlert"
import { CustomerAnalyticsWidget } from "./CustomerAnalytics"
import type { SalesTrendGranularity } from "../types"

/**
 * Dashboard layout, per the Phase 2 spec:
 *
 * Welcome banner
 * KPI Cards (Revenue | Sales | Orders | Customers ...)
 * Sales Analytics        | Inventory Status
 * Top Products           | Recent Transactions
 * Low Stock Alerts       | Customer Insights
 *
 * Widget visibility is RBAC-filtered per the current user's role
 * (features/dashboard/config/widget-visibility.ts) — a role that can't see
 * a widget simply never renders its grid slot, never a disabled placeholder.
 */
export function DashboardContent() {
  const [granularity, setGranularity] = useState<SalesTrendGranularity>("monthly")
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, refetch } = useDashboardSummary(granularity)

  const visibleWidgets = getVisibleWidgets(user?.role)
  const visibleKpiIds = getVisibleKpiIds(user?.role)

  return (
    <div className="flex flex-col gap-6">
      <DashboardGreeting />

      {visibleWidgets.has("kpis") && (
        <KPISection metrics={data?.kpis} isLoading={isLoading} visibleMetricIds={visibleKpiIds} />
      )}

      {(visibleWidgets.has("salesOverview") || visibleWidgets.has("inventoryStatus")) && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleWidgets.has("salesOverview") && (
            <SalesOverview
              data={data?.salesTrend}
              granularity={granularity}
              onGranularityChange={setGranularity}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            />
          )}
          {visibleWidgets.has("inventoryStatus") && (
            <InventoryStatus data={data?.stockDistribution} isLoading={isLoading} isError={isError} onRetry={refetch} />
          )}
        </div>
      )}

      {visibleWidgets.has("revenueChart") && (
        <RevenueChartWidget data={data?.revenueTrend} isLoading={isLoading} isError={isError} onRetry={refetch} />
      )}

      {(visibleWidgets.has("topProducts") || visibleWidgets.has("recentOrders")) && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleWidgets.has("topProducts") && (
            <TopProducts data={data?.topProducts} isLoading={isLoading} isError={isError} onRetry={refetch} />
          )}
          {visibleWidgets.has("recentOrders") && (
            <RecentOrders data={data?.recentOrders} isLoading={isLoading} isError={isError} onRetry={refetch} />
          )}
        </div>
      )}

      {(visibleWidgets.has("lowStockAlert") || visibleWidgets.has("customerAnalytics")) && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleWidgets.has("lowStockAlert") && (
            <LowStockAlert data={data?.lowStockItems} isLoading={isLoading} isError={isError} onRetry={refetch} />
          )}
          {visibleWidgets.has("customerAnalytics") && (
            <CustomerAnalyticsWidget
              summary={data?.customerAnalytics}
              categoryBreakdown={data?.categoryBreakdown}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            />
          )}
        </div>
      )}
    </div>
  )
}
