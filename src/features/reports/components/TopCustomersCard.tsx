"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerCard } from "@/components/sales/CustomerCard"
import { useCustomers } from "@/features/sales/hooks/useCustomers"

/** Top Customers widget for the Executive Dashboard, ranked by total spending. */
export function TopCustomersCard() {
  const { data, isLoading } = useCustomers()
  const top = (data ?? []).slice().sort((a, b) => b.totalSpending - a.totalSpending).slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Customers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : top.length === 0 ? (
          <EmptyState title="No customer data" description="Top customers will appear here." />
        ) : (
          top.map((customer) => <CustomerCard key={customer.id} customer={customer} />)
        )}
      </CardContent>
    </Card>
  )
}
