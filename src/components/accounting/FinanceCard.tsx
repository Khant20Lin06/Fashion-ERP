import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type FinanceCardProps = {
  label: string
  value: string
  helper?: string
  icon?: LucideIcon
  tone?: "default" | "success" | "warning" | "destructive"
}

const toneStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const

/** Finance KPI tile — label, value, optional helper line (e.g. "This Year", "68% Margin"). */
export function FinanceCard({ label, value, helper, icon: Icon, tone = "default" }: FinanceCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <div className={cn("flex size-8 items-center justify-center rounded-md", toneStyles[tone])}>
              <Icon className="size-4" />
            </div>
          )}
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  )
}

export function FinanceCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-8 rounded-md" />
        </div>
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3.5 w-20" />
      </CardContent>
    </Card>
  )
}
