import { CalendarClock, UserCheck, UserPlus, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatPercent } from "@/lib/format"
import type { HrKpis } from "../types"

type HrKpiSectionProps = {
  kpis: HrKpis | undefined
  isLoading: boolean
}

/** The four HR Dashboard KPI tiles: Total Employees, Present Today, On Leave, New Employees. */
export function HrKpiSection({ kpis, isLoading }: HrKpiSectionProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-8 rounded-md" />
              </div>
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3.5 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold tracking-tight">{formatNumber(kpis.totalEmployees)}</p>
          <p className="text-xs text-muted-foreground">{formatNumber(kpis.activeEmployees)} Active Employees</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Present Today</p>
            <div className="flex size-8 items-center justify-center rounded-md bg-success/10 text-success">
              <UserCheck className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold tracking-tight">{formatNumber(kpis.presentToday)}</p>
          <p className="text-xs text-muted-foreground">{formatPercent(kpis.attendanceRatePercent)} Attendance Rate</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">On Leave</p>
            <div className="flex size-8 items-center justify-center rounded-md bg-warning/10 text-warning">
              <CalendarClock className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold tracking-tight">{formatNumber(kpis.onLeaveToday)}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">New Employees</p>
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <UserPlus className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold tracking-tight">{formatNumber(kpis.newEmployeesThisMonth)}</p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </CardContent>
      </Card>
    </div>
  )
}
