"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useCustomerAnalyticsSummary } from "../hooks/useSales"

/** Customer Analytics summary — New Customers, Returning Customers, Customer Lifetime Value. */
export function CustomerAnalyticsSummaryCard() {
  const { data, isLoading } = useCustomerAnalyticsSummary()

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="py-4">
        <CardContent className="px-4">
          <p className="text-xs font-medium text-muted-foreground">New Customers</p>
          <p className="text-xl font-semibold tabular-nums">{formatNumber(data.newCustomers)}</p>
        </CardContent>
      </Card>
      <Card className="py-4">
        <CardContent className="px-4">
          <p className="text-xs font-medium text-muted-foreground">Returning Customers</p>
          <p className="text-xl font-semibold tabular-nums">{formatNumber(data.returningCustomers)}</p>
        </CardContent>
      </Card>
      <Card className="py-4">
        <CardContent className="px-4">
          <p className="text-xs font-medium text-muted-foreground">Customer Lifetime Value</p>
          <p className="text-xl font-semibold tabular-nums">{formatCurrency(data.customerLifetimeValue)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
