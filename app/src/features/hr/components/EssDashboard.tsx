"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { AttendanceBadge } from "@/components/hr/AttendanceBadge"
import { LeaveStatusBadge } from "@/components/hr/LeaveStatusBadge"
import { SalaryCard } from "@/components/hr/SalaryCard"
import { formatRelativeTime } from "@/lib/format"
import { useAttendanceRecords } from "../hooks/useAttendance"
import { useLeaveBalances, useLeaveRequests } from "../hooks/useLeave"
import { usePayrollEntries } from "../hooks/usePayroll"
import { useAnnouncements } from "../hooks/useOrganization"
import type { Employee } from "../types"

type EssDashboardProps = {
  employee: Employee
}

/** Employee Self Service dashboard — My Attendance, My Leave Balance, My Payslip, My Requests, Announcements. */
export function EssDashboard({ employee }: EssDashboardProps) {
  const { data: attendance } = useAttendanceRecords()
  const { data: leaves } = useLeaveRequests()
  const { data: balances } = useLeaveBalances(employee.id)
  const { data: payroll } = usePayrollEntries()
  const { data: announcements } = useAnnouncements()

  const myAttendance = (attendance ?? []).filter((a) => a.employeeId === employee.id).slice(0, 5)
  const myLeaves = (leaves ?? []).filter((l) => l.employeeId === employee.id)
  const myPayslips = (payroll ?? []).filter((p) => p.employeeId === employee.id)

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Attendance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {myAttendance.length === 0 ? (
            <EmptyState title="No attendance yet" description="Your attendance history will appear here." />
          ) : (
            myAttendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between text-sm">
                <span>{new Date(record.date).toLocaleDateString()}</span>
                <AttendanceBadge status={record.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Leave Balance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {!balances || balances.length === 0 ? (
            <EmptyState title="No leave balance data" description="Leave balances will appear here." />
          ) : (
            balances.map((balance) => (
              <div key={balance.type} className="flex items-center justify-between text-sm">
                <span className="capitalize">{balance.type} Leave</span>
                <span className="font-medium">
                  {balance.remaining} / {balance.entitled} days
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Payslip</CardTitle>
        </CardHeader>
        <CardContent>
          {myPayslips.length === 0 ? (
            <EmptyState title="No payslips yet" description="Your payslips will appear here." />
          ) : (
            <SalaryCard entry={myPayslips[0]} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Requests</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {myLeaves.length === 0 ? (
            <EmptyState title="No requests" description="Your leave requests will appear here." />
          ) : (
            myLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between text-sm">
                <span className="capitalize">{leave.type} Leave</span>
                <LeaveStatusBadge status={leave.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Announcements</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!announcements || announcements.length === 0 ? (
            <EmptyState title="No announcements" description="Company announcements will appear here." />
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{announcement.title}</p>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(announcement.date)}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{announcement.body}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
