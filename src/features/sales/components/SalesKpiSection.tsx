import type { LucideIcon } from "lucide-react"
import { Receipt, TrendingUp, UserPlus, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import type { SalesKpis } from "../types"

type KpiTileProps = {
  label: string
  value: string
  helper: string
  icon: LucideIcon
  trend?: "up" | "down"
}

function KpiTile({ label, value, helper, icon: Icon, trend }: KpiTileProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className={cn("text-xs", trend === "up" ? "text-success" : "text-muted-foreground")}>{helper}</p>
      </CardContent>
    </Card>
  )
}

function KpiTileSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-8 rounded-md" />
        </div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3.5 w-28" />
      </CardContent>
    </Card>
  )
}

type SalesKpiSectionProps = {
  kpis: SalesKpis | undefined
  isLoading: boolean
}

/** The four Sales Dashboard KPI tiles: Today's Sales, Monthly Revenue, Orders, Customers. */
export function SalesKpiSection({ kpis, isLoading }: SalesKpiSectionProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiTileSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiTile
        label="Today's Sales"
        value={formatCurrency(kpis.todaysSales)}
        helper={`+${formatPercent(kpis.todaysSalesChangePercent)} vs yesterday`}
        icon={TrendingUp}
        trend="up"
      />
      <KpiTile
        label="Monthly Revenue"
        value={formatCurrency(kpis.monthlyRevenue)}
        helper="This month"
        icon={Receipt}
      />
      <KpiTile
        label="Orders"
        value={formatNumber(kpis.orders)}
        helper="Today"
        icon={Users}
      />
      <KpiTile
        label="Customers"
        value={formatNumber(kpis.customers)}
        helper="Total registered"
        icon={UserPlus}
      />
    </div>
  )
}
