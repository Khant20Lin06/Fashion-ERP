"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard, MetricCardSkeleton } from "@/components/reports/MetricCard"
import { ReportTable } from "@/components/reports/ReportTable"
import { ExportMenu } from "@/components/reports/ExportMenu"
import { Badge } from "@/components/ui/badge"
import {
  StockDistributionChart,
  StockMovementChart,
  InventoryAgingChart,
} from "@/features/reports/charts/InventoryChart"
import {
  useInventoryAging,
  useInventoryMetrics,
  useInventoryReportRows,
  useStockDistribution,
  useStockMovementTrend,
} from "@/features/reports/hooks/useReports"
import { formatCurrency, formatNumber } from "@/lib/format"

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  available: "default",
  low_stock: "outline",
  out_of_stock: "destructive",
  dead_stock: "secondary",
}

export default function InventoryReportPage() {
  const [distributionDimension, setDistributionDimension] = useState<"warehouse" | "category" | "brand">("warehouse")
  const { data: metrics, isLoading: loadingMetrics } = useInventoryMetrics()
  const { data: distributionData } = useStockDistribution(distributionDimension)
  const { data: movementData } = useStockMovementTrend()
  const { data: agingData } = useInventoryAging()
  const { data: rows, isLoading: loadingRows } = useInventoryReportRows()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory Analytics</h1>
        <p className="text-sm text-muted-foreground">Stock value, movement, and aging across all warehouses.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loadingMetrics || !metrics ? (
          Array.from({ length: 6 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Total Stock Value" value={formatCurrency(metrics.totalStockValue)} />
            <MetricCard label="Available Quantity" value={formatNumber(metrics.availableQuantity)} />
            <MetricCard label="Low Stock" value={formatNumber(metrics.lowStockCount)} />
            <MetricCard label="Dead Stock" value={formatNumber(metrics.deadStockCount)} />
            <MetricCard label="Fast Moving" value={formatNumber(metrics.fastMovingCount)} />
            <MetricCard label="Slow Moving" value={formatNumber(metrics.slowMovingCount)} />
          </>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Stock Distribution</CardTitle>
          <div className="flex gap-1.5">
            {(["warehouse", "category", "brand"] as const).map((dim) => (
              <Badge
                key={dim}
                variant={distributionDimension === dim ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setDistributionDimension(dim)}
              >
                {dim}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <StockDistributionChart
            data={distributionData ?? []}
            valueFormat={distributionDimension === "warehouse" ? "currency" : "number"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <StockMovementChart data={movementData ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventory Aging</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryAgingChart data={agingData ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Inventory Report</CardTitle>
          <ExportMenu data={rows ?? []} filename="inventory-report" />
        </CardHeader>
        <CardContent>
          <ReportTable
            isLoading={loadingRows}
            data={rows}
            getRowKey={(row) => row.id}
            columns={[
              { key: "productName", header: "Product", cell: (row) => row.productName },
              { key: "sku", header: "SKU", cell: (row) => row.sku },
              { key: "variantLabel", header: "Variant", cell: (row) => row.variantLabel ?? "—" },
              { key: "warehouseName", header: "Warehouse", cell: (row) => row.warehouseName },
              { key: "quantity", header: "Quantity", cell: (row) => formatNumber(row.quantity) },
              { key: "cost", header: "Cost", cell: (row) => formatCurrency(row.cost) },
              { key: "value", header: "Value", cell: (row) => formatCurrency(row.value) },
              {
                key: "status",
                header: "Status",
                cell: (row) => (
                  <Badge variant={statusVariant[row.status]} className="capitalize">
                    {row.status.replace("_", " ")}
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
