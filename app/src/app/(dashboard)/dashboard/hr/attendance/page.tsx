"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceMetricsSection } from "@/features/hr/components/AttendanceMetricsSection"
import { AttendanceCalendar } from "@/features/hr/components/AttendanceCalendar"
import { AttendanceTable } from "@/features/hr/components/AttendanceTable"
import { useAttendanceMetrics } from "@/features/hr/hooks/useAttendance"

export default function AttendancePage() {
  const { data: metrics, isLoading } = useAttendanceMetrics()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">Track daily check-ins, check-outs, and attendance status.</p>
      </div>

      <AttendanceMetricsSection metrics={metrics} isLoading={isLoading} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceCalendar />
        </CardContent>
      </Card>

      <AttendanceTable />
    </div>
  )
}
