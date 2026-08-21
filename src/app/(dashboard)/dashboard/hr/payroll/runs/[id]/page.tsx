"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { usePayrollRun } from "@/features/payroll/hooks/usePayroll"
import { PayrollRunDetail } from "@/features/payroll/components/PayrollRunDetail"

export default function PayrollRunPage() {
  const params = useParams<{ id: string }>()
  const { data: run, isLoading, isError, refetch } = usePayrollRun(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this payroll run." onRetry={refetch} />

  if (!run) {
    return <EmptyState title="Payroll run not found" description="This run may have been cancelled or removed." />
  }

  return <PayrollRunDetail run={run} />
}
