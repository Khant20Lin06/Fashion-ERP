"use client"

import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { formatRelativeTime } from "@/lib/format"
import { useDeleteScheduledReport, useScheduledReports, useToggleScheduledReport } from "../hooks/useAnalytics"
import type { ReportType } from "../types"

const reportTypeLabels: Record<ReportType, string> = {
  executive: "Executive Dashboard",
  sales: "Sales Report",
  inventory: "Inventory Report",
  purchase: "Purchase Report",
  customer: "Customer Report",
  product: "Product Report",
  finance: "Financial Report",
}

/** Scheduled Reports list — e.g. "Daily Sales Report / Every Morning 8:00 AM / PDF / Manager Email". */
export function ScheduledReportList() {
  const { data, isLoading, isError, refetch } = useScheduledReports()
  const { mutate: toggleReport } = useToggleScheduledReport()
  const { mutate: deleteReport } = useDeleteScheduledReport()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load scheduled reports." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No scheduled reports" description="Schedule a report to have it delivered automatically." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((report) => (
        <Card key={report.id}>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{reportTypeLabels[report.reportType]}</p>
                <Badge variant="outline" className="capitalize">
                  {report.frequency}
                </Badge>
                <Badge variant="secondary" className="uppercase">
                  {report.format}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Every {report.frequency === "daily" ? "morning" : report.frequency} at {report.time} · {report.recipientEmail}
              </p>
              {report.lastSentAt && (
                <p className="text-xs text-muted-foreground">Last sent {formatRelativeTime(report.lastSentAt)}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={report.isActive}
                onCheckedChange={(checked) => toggleReport({ id: report.id, isActive: checked })}
              />
              <Button size="icon" variant="ghost" onClick={() => deleteReport(report.id)} aria-label="Delete schedule">
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
