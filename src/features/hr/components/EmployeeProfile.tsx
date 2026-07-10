"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { EmployeeAvatar } from "@/components/hr/EmployeeAvatar"
import { AttendanceBadge } from "@/components/hr/AttendanceBadge"
import { LeaveStatusBadge } from "@/components/hr/LeaveStatusBadge"
import { SalaryCard } from "@/components/hr/SalaryCard"
import { formatRelativeTime } from "@/lib/format"
import { useAttendanceRecords } from "../hooks/useAttendance"
import { useLeaveRequests } from "../hooks/useLeave"
import { usePayrollEntries, usePerformanceReviews } from "../hooks/usePayroll"
import { useEmployeeDocuments } from "../hooks/useEmployees"
import type { Employee } from "../types"

type EmployeeProfileProps = {
  employee: Employee
}

/** Employee Profile page: header + Overview/Attendance/Leave/Payroll/Performance/Documents tabs. */
export function EmployeeProfile({ employee }: EmployeeProfileProps) {
  const { data: attendance } = useAttendanceRecords()
  const { data: leaves } = useLeaveRequests()
  const { data: payroll } = usePayrollEntries()
  const { data: reviews } = usePerformanceReviews()
  const { data: documents, isLoading: loadingDocuments } = useEmployeeDocuments(employee.id)

  const employeeAttendance = (attendance ?? []).filter((a) => a.employeeId === employee.id)
  const employeeLeaves = (leaves ?? []).filter((l) => l.employeeId === employee.id)
  const employeePayroll = (payroll ?? []).filter((p) => p.employeeId === employee.id)
  const employeeReviews = (reviews ?? []).filter((r) => r.employeeId === employee.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <EmployeeAvatar name={employee.name} photoUrl={employee.photoUrl} size="lg" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{employee.name}</h1>
            <p className="text-sm text-muted-foreground">
              {employee.designation} · {employee.departmentName}
            </p>
            <Badge className="capitalize">{employee.status.replace("_", " ")}</Badge>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/hr/employees/${employee.id}/edit`}>
            <Pencil /> Edit Employee
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Employee ID" value={employee.employeeCode} />
              <DetailField label="Phone" value={employee.phone} />
              <DetailField label="Email" value={employee.email} />
              <DetailField label="Address" value={employee.address} />
              <DetailField label="Branch" value={employee.branchName} />
              <DetailField label="Employment Type" value={employee.employmentType.replace("_", " ")} className="capitalize" />
              <DetailField label="Joining Date" value={new Date(employee.joiningDate).toLocaleDateString()} />
              <DetailField label="Manager" value={employee.managerName ?? "—"} />
              <DetailField label="Shift" value={employee.shiftName ?? "—"} />
              <DetailField label="Working Hours" value={`${employee.workingHoursPerWeek} hrs/week`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {employeeAttendance.length === 0 ? (
                <EmptyState title="No attendance records" description="Attendance history will appear here." />
              ) : (
                employeeAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.checkIn ?? "—"} - {record.checkOut ?? "—"} · {record.workingHours}h
                      </p>
                    </div>
                    <AttendanceBadge status={record.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave Requests</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {employeeLeaves.length === 0 ? (
                <EmptyState title="No leave requests" description="Leave history will appear here." />
              ) : (
                employeeLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-medium capitalize">{leave.type} Leave</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({leave.days}d)
                      </p>
                    </div>
                    <LeaveStatusBadge status={leave.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <div className="flex flex-col gap-4">
            {employeePayroll.length === 0 ? (
              <EmptyState title="No payroll records" description="Payslips will appear here." />
            ) : (
              employeePayroll.map((entry) => <SalaryCard key={entry.id} entry={entry} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {employeeReviews.length === 0 ? (
                <EmptyState title="No reviews yet" description="Performance reviews will appear here." />
              ) : (
                employeeReviews.map((review) => (
                  <div key={review.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium uppercase">{review.period}</p>
                      <span className="font-semibold">{review.score.toFixed(1)} / 5</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{review.managerFeedback}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {loadingDocuments ? (
                <Skeleton className="h-20 w-full" />
              ) : !documents || documents.length === 0 ? (
                <EmptyState title="No documents" description="Uploaded documents will appear here." />
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">{doc.category}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(doc.uploadedAt)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DetailField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm ${className ?? ""}`}>{value}</p>
    </div>
  )
}
