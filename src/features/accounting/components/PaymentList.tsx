"use client"

import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useFinancePayments } from "../hooks/usePayments"
import { PaymentTimeline } from "./PaymentTimeline"

/** Payment list. Real backend Payments are created already CONFIRMED (D14,
 * LOCKED) — no Approved/Paid/Reconciled status transitions exist, so no
 * action buttons are shown for them. */
export function PaymentList() {
  const { data, isLoading, isError, refetch } = useFinancePayments()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load payments." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No payments yet" description="Record a payment to see it here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-medium">{payment.reference}</p>
                <p className="text-xs text-muted-foreground">
                  {payment.partyName}
                  {payment.relatedReference ? ` · ${payment.relatedReference}` : ""} · {formatRelativeTime(payment.date)}
                </p>
              </div>
              <p className={payment.direction === "incoming" ? "font-semibold text-success" : "font-semibold text-destructive"}>
                {payment.direction === "incoming" ? "+" : "-"}
                {formatCurrency(payment.amount)}
              </p>
            </div>
            <PaymentTimeline />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
