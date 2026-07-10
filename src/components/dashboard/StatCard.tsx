import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type StatCardProps = {
  label: string
  value: string | number
  className?: string
}

/**
 * Compact inline stat — no Card chrome, used inside list widgets/panels
 * where a full bordered card would be visually redundant (e.g., a row of
 * quick stats atop a table).
 */
export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-12" />
    </div>
  )
}
