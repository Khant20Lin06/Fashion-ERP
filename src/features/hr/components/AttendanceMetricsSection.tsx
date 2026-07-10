import { AlertTriangle, Clock, TrendingUp, UserCheck, UserX } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/format"
import type { AttendanceMetrics } from "../types"

type AttendanceMetricsSectionProps = {
  metrics: AttendanceMetrics | undefined
  isLoading: boolean
}

/** Attendance metrics: Present, Absent, Late, Early Leave, Overtime. */
export function AttendanceMetricsSection({ metrics, isLoading }: AttendanceMetricsSectionProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  const tiles = [
    { label: "Present", value: metrics.present, icon: UserCheck, tone: "success" as const },
    { label: "Absent", value: metrics.absent, icon: UserX, tone: "destructive" as const },
    { label: "Late", value: metrics.late, icon: Clock, tone: "warning" as const },
    { label: "Early Leave", value: metrics.earlyLeave, icon: AlertTriangle, tone: "warning" as const },
    { label: "Overtime", value: metrics.overtime, icon: TrendingUp, tone: "default" as const },
  ]

  const toneClass = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
  )
}
