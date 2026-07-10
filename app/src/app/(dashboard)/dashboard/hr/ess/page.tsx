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

export default function EssPage() {
  const { data: employees } = useEmployees()
  const [employeeId, setEmployeeId] = useState<string | undefined>(undefined)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

  const employee = employees?.find((e) => e.id === employeeId) ?? employees?.[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employee Self Service</h1>
          <p className="text-sm text-muted-foreground">View your profile, attendance, leave, and payslips.</p>
        </div>
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!employee}>Request Leave</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>
            <LeaveForm onSubmitted={() => setLeaveDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-sm">
        <EmployeeSelector value={employee?.id} onChange={setEmployeeId} placeholder="Select employee" />
      </div>

      {!employee ? (
        <EmptyState title="Select an employee" description="Choose an employee above to view their self-service dashboard." />
      ) : (
        <div className="flex flex-col gap-6">
          <EmployeeCard employee={employee} />
          <EssDashboard employee={employee} />
        </div>
      )}
    </div>
  )
}
