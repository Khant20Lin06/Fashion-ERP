"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionStatus } from "@/components/accounting/TransactionStatus"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useExpenses } from "../hooks/usePayments"
import type { ExpenseCategory } from "../types"

const categoryLabels: Record<ExpenseCategory, string> = {
  salary: "Salary",
  rent: "Rent",
  utilities: "Utilities",
  marketing: "Marketing",
  transport: "Transport",
  maintenance: "Maintenance",
}

/** Expense list. No backend Expense entity exists (BACKEND GAP) — approval
 * workflow actions are not shown since there is no endpoint to call. */
export function ExpenseList() {
  const { data, isLoading, isError, refetch } = useExpenses()

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
      {data.map((expense) => (
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
            <span className="font-semibold">{formatCurrency(expense.amount)}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
