"use client"

import { Separator } from "@/components/ui/separator"
import { ScheduledReportForm } from "@/features/reports/components/ScheduledReportForm"
import { ScheduledReportList } from "@/features/reports/components/ScheduledReportList"

export default function ScheduledReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scheduled Reports</h1>
        <p className="text-sm text-muted-foreground">Automatically deliver reports to stakeholders on a schedule.</p>
      </div>

      <ScheduledReportForm />

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Active Schedules</h2>
        <ScheduledReportList />
      </div>
    </div>
  )
}
