"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import { useArMetrics, useApMetrics } from "../hooks/usePayments"

/** Receivable / Payable summary widget for the Finance Dashboard. */
export function ReceivablePayableCard() {
  const { data: ar, isLoading: loadingAr } = useArMetrics()
  const { data: ap, isLoading: loadingAp } = useApMetrics()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receivable / Payable</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">Accounts Receivable</p>
          {loadingAr || !ar ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p className="text-xl font-semibold text-success">{formatCurrency(ar.totalOutstanding)}</p>
          )}
          <p className="text-xs text-muted-foreground">Outstanding from customers</p>
        </div>
        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">Accounts Payable</p>
          {loadingAp || !ap ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p className="text-xl font-semibold text-destructive">{formatCurrency(ap.outstandingPayable)}</p>
          )}
          <p className="text-xs text-muted-foreground">Owed to suppliers</p>
        </div>
      </CardContent>
    </Card>
  )
}
