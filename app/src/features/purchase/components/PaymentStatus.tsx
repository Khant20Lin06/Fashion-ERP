"use client"

import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { usePayments } from "../hooks/usePayments"

const methodLabels: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  credit: "Credit",
  mobile_payment: "Mobile Payment",
}

/** Recent supplier payments — reference, invoice, amount, method, and outstanding status. */
export function PaymentStatus() {
  const { data, isLoading, isError, refetch } = usePayments()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
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
          <CardContent className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-mono text-sm font-medium">{payment.reference}</p>
              <p className="text-sm text-muted-foreground">
                {payment.supplierName} · {payment.invoiceNumber} · {methodLabels[payment.method]}
              </p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(payment.paymentDate)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(payment.amount)}</p>
              <PurchaseStatusBadge status="paid" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
