"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HrKpiSection } from "@/features/hr/components/HrKpiSection"
import { AttendanceOverviewChart, DepartmentDistributionChart } from "@/features/hr/components/HrCharts"
import { UpcomingEventsCard } from "@/features/hr/components/UpcomingEventsCard"
import { useHrKpis, useDepartmentDistribution } from "@/features/hr/hooks/useOrganization"
import { useAttendanceOverview } from "@/features/hr/hooks/useAttendance"

export default function HrDashboardPage() {
  const { data: kpis, isLoading } = useHrKpis()
  const { data: attendanceData } = useAttendanceOverview()
  const { data: departmentData } = useDepartmentDistribution()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">HR Dashboard</h1>
        <p className="text-sm text-muted-foreground">Workforce overview across attendance, leave, and headcount.</p>
      </div>

      <HrKpiSection kpis={kpis} isLoading={isLoading} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceOverviewChart data={attendanceData ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentDistributionChart data={departmentData ?? []} />
          </CardContent>
        </Card>
        <UpcomingEventsCard />
      </div>
    </div>
  )
}
