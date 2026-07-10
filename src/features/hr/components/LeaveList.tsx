"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { LeaveStatusBadge } from "@/components/hr/LeaveStatusBadge"
import { formatRelativeTime } from "@/lib/format"
import { useLeaveRequests, useUpdateLeaveRequestStatus } from "../hooks/useLeave"
import type { LeaveStatus } from "../types"

const nextStatus: Partial<Record<LeaveStatus, LeaveStatus>> = {
  requested: "manager_approved",
  manager_approved: "hr_approved",
}

const nextStatusLabel: Partial<Record<LeaveStatus, string>> = {
  requested: "Manager Approve",
  manager_approved: "HR Approve",
}

/** Leave Request workflow list: Employee Request -> Manager Approval -> HR Approval -> Leave Balance Update. */
export function LeaveList() {
  const { data, isLoading, isError, refetch } = useLeaveRequests()
  const { mutate: updateStatus, isPending } = useUpdateLeaveRequestStatus()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load leave requests." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No leave requests" description="Submitted leave requests will appear here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((leave) => {
        const upcoming = nextStatus[leave.status]
        return (
          <Card key={leave.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium">{leave.reference}</p>
                  <LeaveStatusBadge status={leave.status} />
                </div>
                <p className="text-sm">
                  {leave.employeeName} · <span className="capitalize">{leave.type}</span> Leave
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({leave.days}d) ·{" "}
                  {formatRelativeTime(leave.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">{leave.reason}</p>
              </div>
              <div className="flex gap-2">
                {upcoming && (
                  <Button size="sm" onClick={() => updateStatus({ id: leave.id, status: upcoming })} disabled={isPending}>
                    {nextStatusLabel[leave.status]}
                  </Button>
                )}
                {leave.status !== "hr_approved" && leave.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus({ id: leave.id, status: "rejected" })}
                    disabled={isPending}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
