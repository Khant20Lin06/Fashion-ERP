"use client"

import { ReportTable } from "@/components/reports/ReportTable"
import { ExportMenu } from "@/components/reports/ExportMenu"
import { MetricCard, MetricCardSkeleton } from "@/components/reports/MetricCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CostChangeChart,
  PurchaseTrendChart,
  SupplierComparisonChart,
} from "@/features/reports/charts/PurchaseChart"
import {
  useCostChangeAnalysis,
  usePurchaseReportMetrics,
  usePurchaseTrend,
  useSupplierComparison,
  useSupplierPerformanceRows,
} from "@/features/reports/hooks/useReports"
import { formatCurrency, formatPercent } from "@/lib/format"

function renderTrackedPercent(value?: number | null) {
  return typeof value === "number" ? formatPercent(value) : "Not tracked"
}

function renderTrackedScore(value?: number | null) {
  return typeof value === "number" ? `${value.toFixed(1)} / 5` : "Not tracked"
}

export default function PurchaseReportsPage() {
  const { data: metrics, isLoading: loadingMetrics } = usePurchaseReportMetrics()
  const { data: supplierRows, isLoading: loadingSuppliers } = useSupplierPerformanceRows()
  const { data: trendData } = usePurchaseTrend()
  const { data: comparisonData } = useSupplierComparison()
  const { data: costChangeData } = useCostChangeAnalysis()

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Reports</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          This page now mirrors the real purchase reporting flow: spend trend, draft purchase order visibility, and
          supplier totals are live. Supplier quality and historical cost-change analytics remain backend roadmap items.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingMetrics || !metrics ? (
          Array.from({ length: 4 }).map((_, index) => <MetricCardSkeleton key={index} />)
        ) : (
          <>
            <MetricCard label="Total Purchase" value={formatCurrency(metrics.totalPurchase)} />
            <MetricCard label="Supplier Count" value={String(metrics.supplierCount)} />
            <MetricCard label="Draft Orders" value={String(metrics.pendingOrders)} />
            <MetricCard label="Average PO Value" value={formatCurrency(metrics.averageCost)} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase Spend Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseTrendChart data={trendData ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Spend Comparison</CardTitle>
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
            {costChangeData && costChangeData.length > 0 ? (
              <CostChangeChart data={costChangeData} />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-sm text-muted-foreground">
                Product cost-change history is not available from the backend yet. Keep this panel as a roadmap slot
                until purchase cost-history reporting is implemented server-side.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Supplier Totals</CardTitle>
            <p className="text-sm text-muted-foreground">
              Real totals come from purchase reports. Non-financial supplier scoring stays marked as not tracked.
            </p>
          </div>
          <ExportMenu data={supplierRows ?? []} filename="purchase-reports-supplier-totals" />
        </CardHeader>
        <CardContent>
          <ReportTable
            isLoading={loadingSuppliers}
            data={supplierRows}
            getRowKey={(row) => row.supplierId}
            columns={[
              { key: "supplierName", header: "Supplier", cell: (row) => row.supplierName },
              { key: "supplierCode", header: "Code", cell: (row) => row.supplierCode },
              { key: "purchaseOrderCount", header: "PO Count", cell: (row) => row.purchaseOrderCount },
              { key: "purchaseAmount", header: "Purchase Amount", cell: (row) => formatCurrency(row.purchaseAmount) },
              {
                key: "deliveryRatePercent",
                header: "Delivery Rate",
                cell: (row) => renderTrackedPercent(row.deliveryRatePercent),
              },
              {
                key: "qualityScore",
                header: "Quality Score",
                cell: (row) => renderTrackedScore(row.qualityScore),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
