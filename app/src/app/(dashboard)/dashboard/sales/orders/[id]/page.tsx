"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useSalesOrder } from "@/features/sales/hooks/useSales"
import { SalesOrderDetail } from "@/features/sales/components/SalesOrderDetail"

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: order, isLoading, isError, refetch } = useSalesOrder(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this sales order." onRetry={refetch} />

  if (!order) {
    return <EmptyState title="Sales order not found" description="This order may have been deleted or moved." />
  }

  return <SalesOrderDetail order={order} />
}
