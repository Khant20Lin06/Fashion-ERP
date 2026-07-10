import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: "default" | "success" | "warning" | "destructive"
  className?: string
}

const toneStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const

/**
 * Simpler single-stat card — no trend/comparison, just a labeled value.
 * Used for counts that don't have a meaningful period-over-period
 * comparison (e.g., "Pending Purchase Orders").
 */
export function MetricCard({ label, value, icon: Icon, tone = "default", className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-4">
        {Icon && (
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", toneStyles[tone])}>
            <Icon className="size-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <Skeleton className="size-10 shrink-0 rounded-md" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}
