"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { LeaveStatusBadge } from "@/components/hr/LeaveStatusBadge"
import { formatRelativeTime } from "@/lib/format"
import { useAuthStore } from "@/stores/auth.store"
import { useEmployees } from "../hooks/useEmployees"
import { useLeaveRequests, useUpdateLeaveRequestStatus } from "../hooks/useLeave"
import { isOwnLeaveRequest } from "../lib/current-user-employee"

/** Leave Request list. Real backend lifecycle is Pending -> Approved /
 * Rejected / Cancelled, with a single approval step. */
export function LeaveList() {
  const user = useAuthStore((state) => state.user)
  const { data, isLoading, isError, refetch } = useLeaveRequests()
  const { data: employees } = useEmployees()
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
        const ownRequest = isOwnLeaveRequest(user, leave.employeeId, employees)

        return (
          <Card key={leave.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium">{leave.reference}</p>
                  <LeaveStatusBadge status={leave.status} />
                </div>
                <p className="text-sm">
                  {leave.employeeName || "Unknown employee"} - {leave.typeLabel ?? leave.type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({leave.days}d) -{" "}
                  {formatRelativeTime(leave.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">{leave.reason}</p>
                {leave.status === "requested" && ownRequest ? (
                  <p className="text-xs text-muted-foreground">You cannot approve or reject your own leave request.</p>
                ) : null}
              </div>
              {leave.status === "requested" && !ownRequest && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateStatus({ id: leave.id, status: "approved" })} disabled={isPending}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus({ id: leave.id, status: "rejected" })}
                    disabled={isPending}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
