"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useEmployee } from "@/features/hr/hooks/useEmployees"
import { EmployeeForm } from "@/features/hr/components/EmployeeForm"

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>()
  const { data: employee, isLoading, isError, refetch } = useEmployee(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this employee." onRetry={refetch} />

  if (!employee) {
    return <EmptyState title="Employee not found" description="This employee may have been removed." />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Employee</h1>
        <p className="text-sm text-muted-foreground">{employee.name}</p>
      </div>
      <EmployeeForm employee={employee} />
    </div>
  )
}
