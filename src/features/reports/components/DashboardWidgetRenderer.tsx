"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/reports/MetricCard"
import { RevenueChart } from "../charts/RevenueChart"
import { ProfitTrendChart } from "../charts/ProfitChart"
import { StockDistributionChart } from "../charts/InventoryChart"
import { CustomerGrowthChart } from "../charts/CustomerChart"
import { PurchaseTrendChart } from "../charts/PurchaseChart"
import { TopProductsCard } from "./TopProductsCard"
import { TopCustomersCard } from "./TopCustomersCard"
import { useExecutiveKpis } from "../hooks/useAnalytics"
import {
  useCustomerGrowth,
  useProfitTrend,
  usePurchaseTrend,
  useSalesRevenueTrend,
  useStockDistribution,
} from "../hooks/useReports"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import type { DashboardWidget } from "../types"

/** Renders one Dashboard Builder widget based on its type. */
export function DashboardWidgetRenderer({ widget }: { widget: DashboardWidget }) {
  const { data: kpis } = useExecutiveKpis()
  const { data: revenueTrend } = useSalesRevenueTrend("monthly")
  const { data: profitTrend } = useProfitTrend()
  const { data: stockDistribution } = useStockDistribution("warehouse")
  const { data: customerGrowth } = useCustomerGrowth()
  const { data: purchaseTrend } = usePurchaseTrend()

  switch (widget.type) {
    case "kpi_revenue":
      return <MetricCard label="Total Revenue" value={kpis ? formatCurrency(kpis.totalRevenue) : "—"} changePercent={kpis?.revenueChangePercent} />
    case "kpi_profit":
      return <MetricCard label="Gross Profit" value={kpis ? formatCurrency(kpis.grossProfit) : "—"} helper={kpis ? `${formatPercent(kpis.grossMarginPercent)} Margin` : undefined} />
    case "kpi_orders":
      return <MetricCard label="Total Orders" value={kpis ? formatNumber(kpis.totalOrders) : "—"} />
    case "kpi_customers":
      return <MetricCard label="Customer Growth" value={kpis ? formatPercent(kpis.customerGrowthPercent) : "—"} changePercent={kpis?.customerGrowthPercent} />
    case "revenue_chart":
      return (
        <Card>
          <CardHeader><CardTitle className="text-base">{widget.title}</CardTitle></CardHeader>
          <CardContent><RevenueChart data={revenueTrend ?? []} height={220} /></CardContent>
        </Card>
      )
    case "profit_chart":
      return (
        <Card>
          <CardHeader><CardTitle className="text-base">{widget.title}</CardTitle></CardHeader>
          <CardContent><ProfitTrendChart data={profitTrend ?? []} height={220} /></CardContent>
        </Card>
      )
    case "inventory_chart":
      return (
        <Card>
          <CardHeader><CardTitle className="text-base">{widget.title}</CardTitle></CardHeader>
          <CardContent><StockDistributionChart data={stockDistribution ?? []} valueFormat="currency" height={220} /></CardContent>
        </Card>
      )
    case "customer_chart":
      return (
        <Card>
          <CardHeader><CardTitle className="text-base">{widget.title}</CardTitle></CardHeader>
          <CardContent><CustomerGrowthChart data={customerGrowth ?? []} height={220} /></CardContent>
        </Card>
      )
    case "purchase_chart":
      return (
        <Card>
          <CardHeader><CardTitle className="text-base">{widget.title}</CardTitle></CardHeader>
          <CardContent><PurchaseTrendChart data={purchaseTrend ?? []} height={220} /></CardContent>
        </Card>
      )
    case "top_products":
      return <TopProductsCard />
    case "top_customers":
      return <TopCustomersCard />
    default:
      return null
  }
}
