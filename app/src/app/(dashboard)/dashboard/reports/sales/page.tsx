"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/reports/DateRangePicker"
import { MetricCard, MetricCardSkeleton } from "@/components/reports/MetricCard"
import { ReportFilter } from "@/components/reports/ReportFilter"
import { ReportTable } from "@/components/reports/ReportTable"
import { ExportMenu } from "@/components/reports/ExportMenu"
import { RevenueChart } from "@/features/reports/charts/RevenueChart"
import { CategorySalesChart, PaymentMethodChart } from "@/features/reports/charts/SalesBreakdownCharts"
import {
  useCategorySales,
  usePaymentMethodSales,
  useSalesDetailRows,
  useSalesMetrics,
  useSalesRevenueTrend,
} from "@/features/reports/hooks/useReports"
import { useReportStore } from "@/features/reports/stores/report.store"
import { formatCurrency } from "@/lib/format"
import type { Granularity } from "@/features/reports/types"

export default function SalesReportPage() {
  const { dateRange, setDateRangePreset, setCustomDateRange } = useReportStore()
  const [granularity, setGranularity] = useState<Granularity>("monthly")
  const [filters, setFilters] = useState<Record<string, string | undefined>>({})

  const { data: metrics, isLoading: loadingMetrics } = useSalesMetrics()
  const { data: revenueTrend } = useSalesRevenueTrend(granularity)
  const { data: categoryData } = useCategorySales()
  const { data: paymentData } = usePaymentMethodSales()
  const { data: detailRows, isLoading: loadingDetail } = useSalesDetailRows()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales Analytics</h1>
          <p className="text-sm text-muted-foreground">Revenue, orders, and sales breakdowns.</p>
        </div>
        <DateRangePicker value={dateRange} onPresetChange={setDateRangePreset} onCustomChange={setCustomDateRange} />
      </div>

      <ReportFilter
        fields={[
          { key: "branch", label: "Branch", options: [{ label: "Main Branch", value: "main" }] },
          { key: "warehouse", label: "Warehouse", options: [{ label: "Yangon Warehouse", value: "wh-yangon" }] },
          { key: "salesPerson", label: "Sales Person", options: [{ label: "Cashier", value: "Cashier" }, { label: "Sales Associate", value: "Sales Associate" }] },
          { key: "customerGroup", label: "Customer Group", options: [{ label: "VIP", value: "VIP" }, { label: "Regular", value: "Regular" }] },
          { key: "productCategory", label: "Category", options: [{ label: "Men", value: "Men" }, { label: "Women", value: "Women" }] },
        ]}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loadingMetrics || !metrics ? (
          Array.from({ length: 6 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Total Sales" value={formatCurrency(metrics.totalSales)} />
            <MetricCard label="Number of Orders" value={String(metrics.orderCount)} />
            <MetricCard label="Average Order Value" value={formatCurrency(metrics.averageOrderValue)} />
            <MetricCard label="Discount Amount" value={formatCurrency(metrics.discountAmount)} />
            <MetricCard label="Return Amount" value={formatCurrency(metrics.returnAmount)} />
            <MetricCard label="Net Sales" value={formatCurrency(metrics.netSales)} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Trend</CardTitle>
          <Tabs value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueTrend ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategorySalesChart data={categoryData ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales By Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentMethodChart data={paymentData ?? []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Sales Detail</CardTitle>
          <ExportMenu data={detailRows ?? []} filename="sales-report" />
        </CardHeader>
        <CardContent>
          <ReportTable
            isLoading={loadingDetail}
            data={detailRows}
            getRowKey={(row) => row.id}
            columns={[
              { key: "date", header: "Date", cell: (row) => new Date(row.date).toLocaleDateString() },
              { key: "invoiceNumber", header: "Invoice", cell: (row) => row.invoiceNumber },
              { key: "customerName", header: "Customer", cell: (row) => row.customerName },
              { key: "productName", header: "Product", cell: (row) => row.productName },
              { key: "amount", header: "Amount", cell: (row) => formatCurrency(row.amount) },
              { key: "discount", header: "Discount", cell: (row) => formatCurrency(row.discount) },
              { key: "paymentMethod", header: "Payment", cell: (row) => row.paymentMethod },
              { key: "salesPerson", header: "Sales Person", cell: (row) => row.salesPerson },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
