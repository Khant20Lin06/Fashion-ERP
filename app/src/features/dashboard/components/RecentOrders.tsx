"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import type { OrderStatus, RecentOrder } from "../types"

const statusVariant: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  processing: "secondary",
  pending: "outline",
  cancelled: "destructive",
  refunded: "destructive",
}

type RecentOrdersProps = {
  data: RecentOrder[] | undefined
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
}

export function RecentOrders({ data, isLoading, isError, onRetry }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest orders across all channels</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/sales/invoices">View all</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : isError ? (
          <ErrorState message="Couldn't load recent orders." onRetry={onRetry} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No transactions" description="Recent orders will appear here as sales come in." />
        ) : (
          <ul className="divide-y divide-border">
            {data.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{order.orderNumber}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {order.customerName} · {formatRelativeTime(order.date)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium">{formatCurrency(order.total)}</span>
                  <Badge variant={statusVariant[order.status]} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
