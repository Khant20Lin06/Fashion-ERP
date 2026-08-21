"use client"

import { useParams } from "next/navigation"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { usePurchaseOrder, useUpdatePurchaseOrderStatus } from "@/features/purchase/hooks/usePurchaseOrders"
import { PurchaseOrderDetail } from "@/features/purchase/components/PurchaseOrderDetail"

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: order, isLoading, isError, refetch } = usePurchaseOrder(params.id)
  const updateStatus = useUpdatePurchaseOrderStatus()

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
    return <EmptyState title="Purchase order not found" description="This order is unavailable or outside your current company scope." />
  }

  return (
    <div className="flex flex-col gap-6">
      {order.status === "draft" ? (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: order.id, status: "cancelled" })}
          >
            <X /> Cancel Order
          </Button>
          <Button
            disabled={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: order.id, status: "approved" })}
          >
            <Check /> Confirm Order
          </Button>
        </div>
      ) : null}

      <PurchaseOrderDetail order={order} />
    </div>
  )
}
