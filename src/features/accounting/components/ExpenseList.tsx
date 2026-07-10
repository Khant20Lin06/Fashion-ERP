"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionStatus } from "@/components/accounting/TransactionStatus"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useExpenses, useUpdateExpenseStatus } from "../hooks/usePayments"
import type { ExpenseCategory, ExpenseStatus } from "../types"

const categoryLabels: Record<ExpenseCategory, string> = {
  salary: "Salary",
  rent: "Rent",
  utilities: "Utilities",
  marketing: "Marketing",
  transport: "Transport",
  maintenance: "Maintenance",
}

const nextStatus: Partial<Record<ExpenseStatus, ExpenseStatus>> = {
  submitted: "manager_approved",
  manager_approved: "finance_approved",
  finance_approved: "paid",
}

const nextStatusLabel: Partial<Record<ExpenseStatus, string>> = {
  submitted: "Manager Approve",
  manager_approved: "Finance Approve",
  finance_approved: "Mark Paid",
}

/** Expense list — Employee submits -> Manager Approval -> Finance Approval -> Payment. */
export function ExpenseList() {
  const { data, isLoading, isError, refetch } = useExpenses()
  const { mutate: updateStatus, isPending } = useUpdateExpenseStatus()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load expenses." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No expenses" description="Submitted expenses will appear here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((expense) => {
        const upcoming = nextStatus[expense.status]
        return (
          <Card key={expense.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium">{expense.reference}</p>
                  <TransactionStatus status={expense.status} />
                  <Badge variant="outline">{categoryLabels[expense.category]}</Badge>
                </div>
                <p className="text-sm">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  {expense.submittedBy} · {formatRelativeTime(expense.createdAt)}
                  {expense.receiptFilename ? ` · 📎 ${expense.receiptFilename}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                {upcoming && (
                  <Button size="sm" onClick={() => updateStatus({ id: expense.id, status: upcoming })} disabled={isPending}>
                    {nextStatusLabel[expense.status]}
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
