"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseTrendChart } from "@/features/purchase/components/PurchaseAnalyticsCharts"
import { SupplierPerformanceTable } from "@/features/purchase/components/SupplierPerformanceTable"
import { ProductCostAnalysisTable } from "@/features/purchase/components/ProductCostAnalysisTable"
import { usePurchaseTrend, useProductCostAnalysis } from "@/features/purchase/hooks/usePurchaseOrders"

export default function PurchaseReportsPage() {
  const { data: trend } = usePurchaseTrend()
  const { data: costAnalysis } = useProductCostAnalysis()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Reports</h1>
        <p className="text-sm text-muted-foreground">Purchase trend, supplier performance, and product cost analysis.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseTrendChart data={trend ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supplier Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierPerformanceTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductCostAnalysisTable data={costAnalysis ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
