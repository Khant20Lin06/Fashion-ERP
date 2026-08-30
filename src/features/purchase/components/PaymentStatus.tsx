"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { usePayments } from "../hooks/usePayments"

/** Recent supplier payments - recorded payments with invoice and PO references. */
export function PaymentStatus() {
  const { data, isLoading, isError, refetch } = usePayments()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load payments." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No payments recorded" description="Record a supplier payment to see it here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium">{payment.reference}</p>
                <Badge variant="outline">Recorded</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {payment.supplierName} | {payment.invoiceNumber || "No invoice link"} | {payment.poNumber || "No PO link"}
              </p>
              <p className="text-xs text-muted-foreground">
                {payment.paymentMethodName} | {formatRelativeTime(payment.paymentDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(payment.amount)}</p>
              {payment.referenceNumber ? (
                <p className="text-xs text-muted-foreground">{payment.referenceNumber}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
