"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { SupplierCard } from "@/components/purchase/SupplierCard"
import { useSuppliers } from "../hooks/useSuppliers"

/** Top Suppliers widget — ranked by total purchase value, for the Purchase Dashboard. */
export function TopSuppliers() {
  const { data, isLoading, isError, refetch } = useSuppliers()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Suppliers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : isError ? (
          <ErrorState message="Couldn't load suppliers." onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No suppliers" description="Add a supplier to see rankings here." />
        ) : (
          data
            .slice()
            .sort((a, b) => b.totalPurchase - a.totalPurchase)
            .slice(0, 3)
            .map((supplier) => <SupplierCard key={supplier.id} supplier={supplier} />)
        )}
      </CardContent>
    </Card>
  )
}
