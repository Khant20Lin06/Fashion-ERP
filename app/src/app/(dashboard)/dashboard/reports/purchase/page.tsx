"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MetricCard, MetricCardSkeleton } from "@/components/reports/MetricCard"
import { ReportTable } from "@/components/reports/ReportTable"
import { ExportMenu } from "@/components/reports/ExportMenu"
import {
  PurchaseTrendChart,
  SupplierComparisonChart,
  CostChangeChart,
} from "@/features/reports/charts/PurchaseChart"
import {
  useCostChangeAnalysis,
  usePurchaseReportMetrics,
  usePurchaseTrend,
  useSupplierComparison,
  useSupplierPerformanceRows,
} from "@/features/reports/hooks/useReports"
import { formatCurrency, formatPercent } from "@/lib/format"

const paymentStatusVariant: Record<string, "default" | "secondary" | "outline"> = {
  paid: "default",
  partial: "secondary",
  unpaid: "outline",
}

export default function PurchaseReportPage() {
  const { data: metrics, isLoading: loadingMetrics } = usePurchaseReportMetrics()
  const { data: supplierRows, isLoading: loadingSuppliers } = useSupplierPerformanceRows()
  const { data: trendData } = usePurchaseTrend()
  const { data: comparisonData } = useSupplierComparison()
  const { data: costChangeData } = useCostChangeAnalysis()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Analytics</h1>
        <p className="text-sm text-muted-foreground">Procurement spend, supplier performance, and cost trends.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingMetrics || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Total Purchase" value={formatCurrency(metrics.totalPurchase)} />
            <MetricCard label="Supplier Count" value={String(metrics.supplierCount)} />
            <MetricCard label="Pending Orders" value={String(metrics.pendingOrders)} />
            <MetricCard label="Average Cost" value={formatCurrency(metrics.averageCost)} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseTrendChart data={trendData ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <SupplierComparisonChart data={comparisonData ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Change Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <CostChangeChart data={costChangeData ?? []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Supplier Performance</CardTitle>
          <ExportMenu data={supplierRows ?? []} filename="supplier-performance" />
        </CardHeader>
        <CardContent>
          <ReportTable
            isLoading={loadingSuppliers}
            data={supplierRows}
            getRowKey={(row) => row.supplierId}
            columns={[
              { key: "supplierName", header: "Supplier", cell: (row) => row.supplierName },
              { key: "purchaseAmount", header: "Purchase Amount", cell: (row) => formatCurrency(row.purchaseAmount) },
              { key: "deliveryRatePercent", header: "Delivery Rate", cell: (row) => formatPercent(row.deliveryRatePercent) },
              { key: "qualityScore", header: "Quality Score", cell: (row) => `${row.qualityScore.toFixed(1)} / 5` },
              {
                key: "paymentStatus",
                header: "Payment Status",
                cell: (row) => (
                  <Badge variant={paymentStatusVariant[row.paymentStatus]} className="capitalize">
                    {row.paymentStatus}
                  </Badge>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
