import { DollarSign, TrendingUp, Users, Wallet } from "lucide-react"
import { MetricCard, MetricCardSkeleton } from "@/components/reports/MetricCard"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import type { ExecutiveKpis } from "../types"

type ExecutiveKpiSectionProps = {
  kpis: ExecutiveKpis | undefined
  isLoading: boolean
}

/** The four Executive Dashboard KPI tiles: Total Revenue, Gross Profit, Total Orders, Customer Growth. */
export function ExecutiveKpiSection({ kpis, isLoading }: ExecutiveKpiSectionProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Total Revenue"
        value={formatCurrency(kpis.totalRevenue)}
        changePercent={kpis.revenueChangePercent}
        icon={DollarSign}
      />
      <MetricCard
        label="Gross Profit"
        value={formatCurrency(kpis.grossProfit)}
        helper={`${formatPercent(kpis.grossMarginPercent)} Margin`}
        icon={Wallet}
      />
      <MetricCard label="Total Orders" value={formatNumber(kpis.totalOrders)} icon={TrendingUp} />
      <MetricCard
        label="Customer Growth"
        value={formatPercent(kpis.customerGrowthPercent)}
        changePercent={kpis.customerGrowthPercent}
        icon={Users}
      />
    </div>
  )
}
