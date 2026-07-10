import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMetricValue, formatPercent } from "@/lib/format"
import type { KpiMetric } from "@/features/dashboard/types"

type KPICardProps = {
  metric: KpiMetric
  icon?: LucideIcon
  description?: string
}

const trendStyles = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
} as const

const trendIcons = { up: TrendingUp, down: TrendingDown, flat: Minus } as const

/**
 * Core KPI card: title, value, percentage change, trend indicator, icon,
 * description. Every dashboard metric renders through this one component —
 * never a bespoke card per metric.
 */
export function KPICard({ metric, icon: Icon, description }: KPICardProps) {
  const TrendIcon = trendIcons[metric.trend]

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
          {Icon && (
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
          )}
        </div>

        <p className="text-2xl font-semibold tracking-tight">
          {formatMetricValue(metric.value, metric.format)}
        </p>

        <div className="flex items-center gap-1.5 text-sm">
          <span className={cn("flex items-center gap-1 font-medium", trendStyles[metric.trend])}>
            <TrendIcon className="size-3.5" />
            {metric.changePercent > 0 && "+"}
            {formatPercent(metric.changePercent)}
          </span>
          <span className="text-muted-foreground">{metric.comparisonLabel}</span>
        </div>

        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

export function KPICardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-8 rounded-md" />
        </div>
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  )
}
