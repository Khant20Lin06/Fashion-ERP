"use client"

import { SalesKpiSection } from "@/features/sales/components/SalesKpiSection"
import { RevenueTrendChart } from "@/features/sales/components/RevenueTrendChart"
import { TopSellingProducts } from "@/features/sales/components/TopSellingProducts"
import { RecentTransactions } from "@/features/sales/components/RecentTransactions"
import { useSalesKpis } from "@/features/sales/hooks/useSales"

export default function SalesDashboardPage() {
  const { data: kpis, isLoading } = useSalesKpis()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sales Dashboard</h1>
        <p className="text-sm text-muted-foreground">Retail performance across POS, orders, and customers.</p>
      </div>

      <SalesKpiSection kpis={kpis} isLoading={isLoading} />

      <RevenueTrendChart />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopSellingProducts />
        <RecentTransactions />
      </div>
    </div>
  )
}
