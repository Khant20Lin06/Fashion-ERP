"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionStatus } from "@/components/accounting/TransactionStatus"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useFinancePayments } from "../hooks/usePayments"

/** Recent Transactions widget for the Finance Dashboard — latest recorded payments. */
export function RecentTransactionsCard() {
  const { data, isLoading } = useFinancePayments()
  const recent = (data ?? [])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : recent.length === 0 ? (
          <EmptyState title="No transactions yet" description="Recorded payments will appear here." />
        ) : (
          recent.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
              <div className="min-w-0">
                <p className="font-mono font-medium">{payment.reference}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {payment.partyName} · {formatRelativeTime(payment.date)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={payment.direction === "incoming" ? "font-medium text-success" : "font-medium text-destructive"}>
                  {payment.direction === "incoming" ? "+" : "-"}
                  {formatCurrency(payment.amount)}
                </span>
                <TransactionStatus status={payment.status} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
