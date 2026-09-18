"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OnlineOrderDetail } from "@/features/online-orders/components/OnlineOrderDetail"
import { useOnlineOrder } from "@/features/online-orders/hooks/useOnlineOrders"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"

export default function OnlineOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: order, isLoading, isError, refetch } = useOnlineOrder(id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
          <Link href="/dashboard/sales/online-orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Online Orders
          </Link>
        </Button>
        <ErrorState
          title="Online Order Not Found"
          message="The requested online order could not be loaded or does not exist."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
        <Link href="/dashboard/sales/online-orders">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Online Orders
        </Link>
      </Button>

      <OnlineOrderDetail order={order} />
    </div>
  )
}
