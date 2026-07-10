"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard, MetricCardSkeleton } from "@/components/reports/MetricCard"
import {
  CustomerGrowthChart,
  CustomerSegmentChart,
  PurchaseFrequencyChart,
  SpendingDistributionChart,
} from "@/features/reports/charts/CustomerChart"
import {
  useCustomerGrowth,
  useCustomerInsightMetrics,
  useCustomerSegments,
  usePurchaseFrequency,
  useSpendingDistribution,
} from "@/features/reports/hooks/useReports"
import { formatCurrency, formatNumber } from "@/lib/format"

export default function CustomerReportPage() {
  const { data: metrics, isLoading: loadingMetrics } = useCustomerInsightMetrics()
  const { data: segments } = useCustomerSegments()
  const { data: growth } = useCustomerGrowth()
  const { data: frequency } = usePurchaseFrequency()
  const { data: spending } = useSpendingDistribution()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customer Analytics</h1>
        <p className="text-sm text-muted-foreground">Segmentation, growth, and spending behavior.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loadingMetrics || !metrics ? (
          Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Total Customers" value={formatNumber(metrics.totalCustomers)} />
            <MetricCard label="New Customers" value={formatNumber(metrics.newCustomers)} />
            <MetricCard label="Returning Customers" value={formatNumber(metrics.returningCustomers)} />
            <MetricCard label="VIP Customers" value={formatNumber(metrics.vipCustomers)} />
            <MetricCard label="Customer Lifetime Value" value={formatCurrency(metrics.customerLifetimeValue)} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerGrowthChart data={growth ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Segmentation</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSegmentChart data={segments ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Purchase Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseFrequencyChart data={frequency ?? []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingDistributionChart data={spending ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
