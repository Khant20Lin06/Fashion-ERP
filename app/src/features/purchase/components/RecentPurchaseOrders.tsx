"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { usePurchaseOrders } from "../hooks/usePurchaseOrders"

/** Recent Purchase Orders widget for the Purchase Dashboard. */
export function RecentPurchaseOrders() {
  const { data, isLoading, isError, refetch } = usePurchaseOrders()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Purchase Orders</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : isError ? (
          <ErrorState message="Couldn't load purchase orders." onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No purchase orders" description="Create a purchase order to see it here." />
        ) : (
          data
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/purchase/orders/${order.id}`}
                className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-accent/50"
              >
                <div className="min-w-0">
                  <p className="font-mono font-medium">{order.poNumber}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {order.supplierName} · {formatRelativeTime(order.date)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-medium">{formatCurrency(order.grandTotal)}</span>
                  <PurchaseStatusBadge status={order.status} />
                </div>
              </Link>
            ))
        )}
      </CardContent>
    </Card>
  )
}
