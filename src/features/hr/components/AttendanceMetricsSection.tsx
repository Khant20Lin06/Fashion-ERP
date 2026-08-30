import { Clock, UserCheck, UserX } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/format"
import type { AttendanceMetrics } from "../types"

type AttendanceMetricsSectionProps = {
  metrics: AttendanceMetrics | undefined
  isLoading: boolean
}

function formatSummaryDate(value: string | null | undefined): string | null {
  if (!value) return null
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day))
}

/** Attendance metrics: Present, Absent, Late. No Early Leave/Overtime tile -
 * no backend calculation exists for either (see attendance.api.ts). */
export function AttendanceMetricsSection({ metrics, isLoading }: AttendanceMetricsSectionProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  const tiles = [
    { label: "Present", value: metrics.present, icon: UserCheck, tone: "success" as const },
    { label: "Absent", value: metrics.absent, icon: UserX, tone: "destructive" as const },
    { label: "Late", value: metrics.late, icon: Clock, tone: "warning" as const },
  ]
  const summaryDate = formatSummaryDate(metrics.summaryDate)

  const toneClass = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {summaryDate ? `Latest recorded day: ${summaryDate}` : "Latest recorded day unavailable"}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.label} className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-md ${toneClass[tile.tone]}`}>
                <tile.icon className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{tile.label}</p>
                <p className="text-lg font-semibold">{formatNumber(tile.value)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
