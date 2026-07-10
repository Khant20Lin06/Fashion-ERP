"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseKpiSection } from "@/features/purchase/components/PurchaseKpiSection"
import { PurchaseTrendChart } from "@/features/purchase/components/PurchaseAnalyticsCharts"
import { RecentPurchaseOrders } from "@/features/purchase/components/RecentPurchaseOrders"
import { TopSuppliers } from "@/features/purchase/components/TopSuppliers"
import { usePurchaseKpis, usePurchaseTrend } from "@/features/purchase/hooks/usePurchaseOrders"

export default function PurchaseDashboardPage() {
  const { data: kpis, isLoading: loadingKpis } = usePurchaseKpis()
  const { data: trend } = usePurchaseTrend()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Dashboard</h1>
        <p className="text-sm text-muted-foreground">Procurement overview across suppliers, orders, and payments.</p>
      </div>

      <PurchaseKpiSection kpis={kpis} isLoading={loadingKpis} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseTrendChart data={trend ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentPurchaseOrders />
        <TopSuppliers />
      </div>
    </div>
  )
}
