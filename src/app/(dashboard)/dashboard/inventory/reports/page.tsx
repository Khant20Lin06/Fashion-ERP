"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CategoryStockChart,
  MovementTrendChart,
  StockValueChart,
} from "@/features/inventory/components/InventoryChart"
import {
  useCategoryStockDistribution,
  useMovementTrend,
  useStockValueByWarehouse,
} from "@/features/inventory/hooks/useInventory"

export default function InventoryReportsPage() {
  const { data: stockValueData } = useStockValueByWarehouse()
  const { data: categoryData } = useCategoryStockDistribution()
  const { data: trendData } = useMovementTrend()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory Reports</h1>
        <p className="text-sm text-muted-foreground">Stock valuation, category distribution, and movement trends.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Value by Warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            <StockValueChart data={stockValueData ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Stock Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryStockChart data={categoryData ?? []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movement Trend — Incoming vs Outgoing</CardTitle>
        </CardHeader>
        <CardContent>
          <MovementTrendChart data={trendData ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
