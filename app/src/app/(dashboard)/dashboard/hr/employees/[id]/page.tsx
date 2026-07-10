"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useEmployee } from "@/features/hr/hooks/useEmployees"
import { EmployeeProfile } from "@/features/hr/components/EmployeeProfile"

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>()
  const { data: employee, isLoading, isError, refetch } = useEmployee(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this employee." onRetry={refetch} />

  if (!employee) {
    return <EmptyState title="Employee not found" description="This employee may have been removed." />
  }

  return <EmployeeProfile employee={employee} />
}
