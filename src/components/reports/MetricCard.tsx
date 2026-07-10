import type { LucideIcon } from "lucide-react"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatPercent } from "@/lib/format"

type MetricCardProps = {
  label: string
  value: string
  helper?: string
  changePercent?: number
  icon?: LucideIcon
}

/** Report KPI tile — label, value, optional helper line, optional trend delta (e.g. "+18%"). */
export function MetricCard({ label, value, helper, changePercent, icon: Icon }: MetricCardProps) {
  const trend = changePercent === undefined ? undefined : changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat"
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
          )}
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {changePercent !== undefined ? (
          <span
            className={cn(
              "flex w-fit items-center gap-1 text-xs font-medium",
              trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <TrendIcon className="size-3.5" />
            {changePercent > 0 ? "+" : ""}
            {formatPercent(changePercent)}
          </span>
        ) : helper ? (
          <p className="text-xs text-muted-foreground">{helper}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-8 rounded-md" />
        </div>
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3.5 w-16" />
      </CardContent>
    </Card>
  )
}
