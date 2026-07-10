"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useFinancePayments, useUpdateFinancePaymentStatus } from "../hooks/usePayments"
import { PaymentTimeline } from "./PaymentTimeline"
import type { FinancePaymentStatus } from "../types"

const nextStatus: Partial<Record<FinancePaymentStatus, FinancePaymentStatus>> = {
  created: "approved",
  approved: "paid",
  paid: "reconciled",
}

const nextStatusLabel: Partial<Record<FinancePaymentStatus, string>> = {
  created: "Approve",
  approved: "Mark Paid",
  paid: "Reconcile",
}

/** Payment list with lifecycle timeline — Created -> Approved -> Paid -> Reconciled. */
export function PaymentList() {
  const { data, isLoading, isError, refetch } = useFinancePayments()
  const { mutate: updateStatus, isPending } = useUpdateFinancePaymentStatus()

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
      {data.map((payment) => {
        const upcoming = nextStatus[payment.status]
        return (
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
                <div className="text-right">
                  <p className={payment.direction === "incoming" ? "font-semibold text-success" : "font-semibold text-destructive"}>
                    {payment.direction === "incoming" ? "+" : "-"}
                    {formatCurrency(payment.amount)}
                  </p>
                  {upcoming && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1"
                      onClick={() => updateStatus({ id: payment.id, status: upcoming })}
                      disabled={isPending}
                    >
                      {nextStatusLabel[payment.status]}
                    </Button>
                  )}
                </div>
              </div>
              <PaymentTimeline status={payment.status} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
