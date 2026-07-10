"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard, MetricCardSkeleton } from "@/components/reports/MetricCard"
import { ReportTable } from "@/components/reports/ReportTable"
import { ExportMenu } from "@/components/reports/ExportMenu"
import { ColorAnalysisChart, SizeAnalysisChart } from "@/features/reports/charts/ProductAnalysisCharts"
import {
  useColorAnalysis,
  useProductPerformanceMetrics,
  useProductRankings,
  useSizeAnalysis,
} from "@/features/reports/hooks/useReports"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"

export default function ProductReportPage() {
  const { data: metrics, isLoading: loadingMetrics } = useProductPerformanceMetrics()
  const { data: rankings, isLoading: loadingRankings } = useProductRankings()
  const { data: sizeData } = useSizeAnalysis()
  const { data: colorData } = useColorAnalysis()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Product Analytics</h1>
        <p className="text-sm text-muted-foreground">Product performance, and fashion-specific size/color trends.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingMetrics || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Top Selling Products" value={String(metrics.topSellingCount)} />
            <MetricCard label="Highest Profit Products" value={String(metrics.highestProfitCount)} />
            <MetricCard label="Slow Moving Products" value={String(metrics.slowMovingCount)} />
            <MetricCard label="Out Of Stock Products" value={String(metrics.outOfStockCount)} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Size Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <SizeAnalysisChart data={sizeData ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Color Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ColorAnalysisChart data={colorData ?? []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Product Performance</CardTitle>
          <ExportMenu data={rankings ?? []} filename="product-performance" />
        </CardHeader>
        <CardContent>
          <ReportTable
            isLoading={loadingRankings}
            data={rankings}
            getRowKey={(row) => row.productName}
            columns={[
              { key: "productName", header: "Product", cell: (row) => row.productName },
              { key: "unitsSold", header: "Units Sold", cell: (row) => formatNumber(row.unitsSold) },
              { key: "revenue", header: "Revenue", cell: (row) => formatCurrency(row.revenue) },
              { key: "profitMargin", header: "Profit Margin", cell: (row) => formatPercent(row.profitMargin) },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
