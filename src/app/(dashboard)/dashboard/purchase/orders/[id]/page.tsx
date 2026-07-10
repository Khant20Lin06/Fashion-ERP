"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { usePurchaseOrder } from "@/features/purchase/hooks/usePurchaseOrders"
import { PurchaseOrderDetail } from "@/features/purchase/components/PurchaseOrderDetail"

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: order, isLoading, isError, refetch } = usePurchaseOrder(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this purchase order." onRetry={refetch} />

  if (!order) {
    return <EmptyState title="Purchase order not found" description="This order may have been deleted or moved." />
  }

  return <PurchaseOrderDetail order={order} />
}
