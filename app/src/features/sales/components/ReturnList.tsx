"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ReturnStatusBadge } from "@/components/sales/ReturnStatusBadge"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useSalesReturns, useUpdateSalesReturnStatus } from "../hooks/useInvoice"
import type { ReturnType } from "../types"

const typeLabels: Record<ReturnType, string> = {
  product_return: "Product Return",
  exchange: "Exchange",
  refund: "Refund",
  store_credit: "Store Credit",
}

/** Returns & Refund workflow list: Customer Request -> Approval -> Inventory Update -> Refund Processing. */
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
    return <EmptyState title="No return requests" description="Submitted returns will appear here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((ret) => (
        <Card key={ret.id}>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium">{ret.reference}</p>
                <ReturnStatusBadge status={ret.status} />
                <Badge variant="outline">{typeLabels[ret.type]}</Badge>
              </div>
              <p className="text-sm">
                {ret.customerName} · {ret.invoiceNumber}
              </p>
              <p className="text-xs text-muted-foreground">{ret.reason}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(ret.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatCurrency(ret.refundAmount)}</span>
              {ret.status === "requested" && (
                <Button size="sm" onClick={() => updateStatus({ id: ret.id, status: "approved" })} disabled={isPending}>
                  Approve
                </Button>
              )}
              {ret.status === "approved" && (
                <Button size="sm" onClick={() => updateStatus({ id: ret.id, status: "processed" })} disabled={isPending}>
                  Process Refund
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
