"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ReturnStatusBadge } from "@/components/sales/ReturnStatusBadge"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useInvoices } from "../hooks/useInvoice"

/** Recent Transactions widget for the Sales Dashboard. */
export function RecentTransactions() {
  const { data, isLoading, isError, refetch } = useInvoices()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : isError ? (
          <ErrorState message="Couldn't load transactions." onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No transactions yet" description="Sales will appear here once recorded." />
        ) : (
          data
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((invoice) => (
              <Link
                key={invoice.id}
                href={`/dashboard/sales/invoices/${invoice.id}`}
                className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-accent/50"
              >
                <div className="min-w-0">
                  <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {invoice.customerName} · {formatRelativeTime(invoice.date)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-medium">{formatCurrency(invoice.grandTotal)}</span>
                  <ReturnStatusBadge status={invoice.paymentStatus} />
                </div>
              </Link>
            ))
        )}
      </CardContent>
    </Card>
  )
}
