"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryKpiSection } from "@/features/inventory/components/InventoryKpiSection"
import { StockValueChart } from "@/features/inventory/components/InventoryChart"
import { InventoryTable } from "@/features/inventory/components/InventoryTable"
import { useInventoryKpis, useStockValueByWarehouse } from "@/features/inventory/hooks/useInventory"

export default function InventoryOverviewPage() {
  const { data: kpis, isLoading: loadingKpis } = useInventoryKpis()
  const { data: stockValueData } = useStockValueByWarehouse()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory Overview</h1>
        <p className="text-sm text-muted-foreground">
          Real-time stock levels, valuation, and availability across all warehouses.
        </p>
      </div>

      <InventoryKpiSection kpis={kpis} isLoading={loadingKpis} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Value by Warehouse</CardTitle>
        </CardHeader>
        <CardContent>
          <StockValueChart data={stockValueData ?? []} />
        </CardContent>
      </Card>

      <InventoryTable />
    </div>
  )
}
