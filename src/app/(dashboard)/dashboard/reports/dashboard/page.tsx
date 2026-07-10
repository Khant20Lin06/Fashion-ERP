"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/reports/DateRangePicker"
import { ExecutiveKpiSection } from "@/features/reports/components/ExecutiveKpiSection"
import { InventoryHealthCard } from "@/features/reports/components/InventoryHealthCard"
import { TopProductsCard } from "@/features/reports/components/TopProductsCard"
import { TopCustomersCard } from "@/features/reports/components/TopCustomersCard"
import { RevenueChart, SalesPerformanceChart } from "@/features/reports/charts/RevenueChart"
import { useExecutiveKpis, useExecutiveInventoryHealth, useSalesPerformance } from "@/features/reports/hooks/useAnalytics"
import { useSalesRevenueTrend } from "@/features/reports/hooks/useReports"
import { useReportStore } from "@/features/reports/stores/report.store"

export default function ExecutiveDashboardPage() {
  const { dateRange, setDateRangePreset, setCustomDateRange } = useReportStore()
  const { data: kpis, isLoading: loadingKpis } = useExecutiveKpis()
  const { data: revenueTrend } = useSalesRevenueTrend("monthly")
  const { data: salesPerformance } = useSalesPerformance()
  const { data: inventoryHealth, isLoading: loadingInventoryHealth } = useExecutiveInventoryHealth()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">Business-wide performance for owners and managers.</p>
        </div>
        <DateRangePicker value={dateRange} onPresetChange={setDateRangePreset} onCustomChange={setCustomDateRange} />
      </div>

      <ExecutiveKpiSection kpis={kpis} isLoading={loadingKpis} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueTrend ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Performance — Target vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesPerformanceChart data={salesPerformance ?? []} />
        </CardContent>
      </Card>

      <InventoryHealthCard data={inventoryHealth} isLoading={loadingInventoryHealth} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopProductsCard />
        <TopCustomersCard />
      </div>
    </div>
  )
}
