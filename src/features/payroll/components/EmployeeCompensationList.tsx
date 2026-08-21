"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import { useEmployeeCompensation } from "../hooks/usePayroll"
import { EmployeeCompensationFormDialog } from "./EmployeeCompensationForm"

/** Compensation history for one employee — real GET /employees/:employeeId/compensation. Append-only: the most recent row (no effectiveTo, or the latest effectiveFrom) is the current salary. */
export function EmployeeCompensationList({ employeeId }: { employeeId: string }) {
  const { data, isLoading, isError, refetch } = useEmployeeCompensation(employeeId)
  const [formOpen, setFormOpen] = useState(false)

  const sorted = (data ?? []).slice().sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus /> Add Compensation Record
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : isError ? (
        <ErrorState message="Couldn't load compensation history." onRetry={refetch} />
      ) : sorted.length === 0 ? (
        <EmptyState title="No compensation records" description="Add a base salary record to enable payroll for this employee." />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((record, index) => (
            <Card key={record.id}>
              <CardContent className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatCurrency(Number(record.baseSalary))}</span>
                    <span className="text-xs text-muted-foreground">{record.currency}</span>
                    {index === 0 && <Badge>Current</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Effective {new Date(record.effectiveFrom).toLocaleDateString()}
                    {record.effectiveTo ? ` – ${new Date(record.effectiveTo).toLocaleDateString()}` : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EmployeeCompensationFormDialog open={formOpen} onOpenChange={setFormOpen} employeeId={employeeId} />
    </div>
  )
}
