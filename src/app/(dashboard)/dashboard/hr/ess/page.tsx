"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { EmployeeCard } from "@/components/hr/EmployeeCard"
import { EmployeeSelector } from "@/features/hr/components/EmployeeSelector"
import { EssDashboard } from "@/features/hr/components/EssDashboard"
import { LeaveForm } from "@/features/hr/components/LeaveForm"
import { useEmployees } from "@/features/hr/hooks/useEmployees"
import { canPreviewEssAsEmployee, resolveEmployeeForUser } from "@/features/hr/lib/current-user-employee"
import { useAuthStore } from "@/stores/auth.store"

export default function EssPage() {
  const user = useAuthStore((state) => state.user)
  const authLoading = useAuthStore((state) => state.isLoading)
  const { data: employees, isLoading: employeesLoading } = useEmployees()
  const [previewEmployeeId, setPreviewEmployeeId] = useState<string | undefined>(undefined)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

  const ownEmployee = resolveEmployeeForUser(user, employees)
  const canPreview = canPreviewEssAsEmployee(user)
  const previewEmployee = employees?.find((employee) => employee.id === previewEmployeeId)
  const employee = previewEmployee ?? ownEmployee
  const canRequestLeave = !!ownEmployee && employee?.id === ownEmployee.id

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employee Self Service</h1>
          <p className="text-sm text-muted-foreground">View your profile, attendance, leave, and payslips.</p>
        </div>
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canRequestLeave}>Request Leave</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>
            <LeaveForm
              fixedEmployeeId={ownEmployee?.id}
              fixedEmployeeName={ownEmployee?.name}
              onSubmitted={() => setLeaveDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {authLoading || employeesLoading ? (
        <EmptyState title="Loading employee profile" description="Checking which employee record is linked to your account." />
      ) : !user ? (
        <EmptyState title="Not signed in" description="Sign in again to open your employee self-service dashboard." />
      ) : !employee && !canPreview ? (
        <EmptyState
          title="No employee profile linked"
          description="Your signed-in user is not linked to an employee record yet. Ask HR or an admin to connect this account to an employee."
        />
      ) : !employee ? (
        <div className="flex flex-col gap-4">
          <div className="max-w-sm">
            <EmployeeSelector
              employees={employees}
              value={previewEmployeeId}
              onChange={setPreviewEmployeeId}
              placeholder="Preview employee"
            />
          </div>
          <EmptyState
            title="Choose an employee to preview"
            description="Preview mode is available for HR and admin roles. Select an employee to inspect their ESS screen."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {canPreview ? (
            <div className="flex flex-col gap-2">
              <div className="max-w-sm">
                <EmployeeSelector
                  employees={employees}
                  value={previewEmployeeId ?? ownEmployee?.id}
                  onChange={(value) => setPreviewEmployeeId(value === ownEmployee?.id ? undefined : value)}
                  placeholder="Preview employee"
                />
              </div>
              {employee.id !== ownEmployee?.id ? (
                <p className="text-sm text-muted-foreground">
                  Preview mode is showing another employee. Leave requests remain locked to your own ESS profile.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">You are viewing your own ESS profile.</p>
              )}
            </div>
          ) : null}
          <EmployeeCard employee={employee} />
          <EssDashboard employee={employee} />
        </div>
      )}
    </div>
  )
}
