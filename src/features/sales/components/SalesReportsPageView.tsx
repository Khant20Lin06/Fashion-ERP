"use client"

import { DateRangePicker } from "@/components/reports/DateRangePicker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBranches } from "@/features/inventory/hooks/useWarehouse"
import { useReportStore } from "@/features/reports/stores/report.store"
import { CustomerAnalyticsSummaryCard } from "./CustomerAnalyticsSummaryCard"
import { ProductPerformanceTable } from "./ProductPerformanceTable"
import { RevenueTrendChart } from "./RevenueTrendChart"

export function SalesReportsPageView() {
  const { dateRange, setDateRangePreset, setCustomDateRange, branch, setBranch } = useReportStore()
  const { data: branches } = useBranches()
  const filters = {
    branchId: branch,
    fromDate: dateRange.from,
    toDate: dateRange.to,
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales Reports</h1>
          <p className="text-sm text-muted-foreground">Revenue trend, product performance, and customer analytics.</p>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <DateRangePicker
            value={dateRange}
            onPresetChange={setDateRangePreset}
            onCustomChange={setCustomDateRange}
          />
          <div className="min-w-52">
            <Select value={branch ?? "all"} onValueChange={(value) => setBranch(value === "all" ? undefined : value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {(branches ?? []).map((branchOption) => (
                  <SelectItem key={branchOption.id} value={branchOption.id}>
                    {branchOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Current Scope</CardTitle>
          <CardDescription>
            Reports are now calculated from confirmed sales only, using the selected date range and branch.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-2 py-1">From: {new Date(dateRange.from).toLocaleDateString()}</span>
          <span className="rounded-full border px-2 py-1">To: {new Date(dateRange.to).toLocaleDateString()}</span>
          <span className="rounded-full border px-2 py-1">
            Branch: {branches?.find((item) => item.id === branch)?.name ?? "All branches"}
          </span>
        </CardContent>
      </Card>

      <RevenueTrendChart filters={filters} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Performance</CardTitle>
          <CardDescription>Top sellers and slow movers come from the same filtered sales scope.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductPerformanceTable filters={filters} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Analytics</CardTitle>
          <CardDescription>
            New and returning customers are calculated from the selected period, and spend is averaged per active customer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerAnalyticsSummaryCard filters={filters} />
        </CardContent>
      </Card>
    </div>
  )
}
