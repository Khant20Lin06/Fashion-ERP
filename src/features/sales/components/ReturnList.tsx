"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ReturnStatusBadge } from "@/components/sales/ReturnStatusBadge"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useSalesReturns, useUpdateSalesReturnStatus } from "../hooks/useInvoice"

/** Sales return list — create draft returns here, then confirm them; refunded state comes from payment allocations. */
export function ReturnList() {
  const { data, isLoading, isError, refetch } = useSalesReturns()
  const { mutate: updateStatus, isPending } = useUpdateSalesReturnStatus()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load returns." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No return requests" description="Sales return activity will appear here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((ret) => (
        <Card key={ret.id}>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium">{ret.returnNumber}</p>
                <ReturnStatusBadge status={ret.status} />
              </div>
              <p className="text-sm">
                {ret.customerName} · {ret.invoiceNumber}
              </p>
              <p className="text-xs text-muted-foreground">{ret.reason}</p>
              {ret.notes ? <p className="text-xs text-muted-foreground">{ret.notes}</p> : null}
              {ret.status === "draft" && !ret.saleWarehouseId ? (
                <p className="text-xs font-medium text-destructive">
                  The original sale has no warehouse assigned. We'll try to infer the branch warehouse when you confirm.
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">{formatRelativeTime(ret.createdAt)}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(ret.refundAmount)}</p>
                {ret.status !== "draft" ? (
                  <p className="text-xs text-muted-foreground">
                    Refunded: {formatCurrency(ret.refundedAmount)} / {formatCurrency(ret.refundAmount)}
                  </p>
                ) : null}
              </div>
              {ret.status === "draft" ? (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => updateStatus({ id: ret.id, status: "confirmed" })} disabled={isPending}>
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus({ id: ret.id, status: "cancelled" })}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
