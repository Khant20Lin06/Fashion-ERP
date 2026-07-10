"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { formatRelativeTime } from "@/lib/format"
import { usePurchaseRequests, useUpdatePurchaseRequestStatus } from "../hooks/usePurchaseOrders"

/** Purchase Request workflow list: Draft -> Submitted -> Approved -> Converted to Purchase Order. */
export function PurchaseRequestList() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = usePurchaseRequests()
  const { mutate: updateStatus, isPending } = useUpdatePurchaseRequestStatus()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load purchase requests." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No purchase requests" description="Create a purchase request to see it here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((request) => (
        <Card key={request.id}>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium">{request.reference}</p>
                <PurchaseStatusBadge status={request.status} />
              </div>
              <p className="text-sm">
                {request.department} · Requested by {request.requester}
              </p>
              <p className="text-xs text-muted-foreground">
                {request.items.length} item(s) · Required by {new Date(request.requiredDate).toLocaleDateString()} ·{" "}
                {formatRelativeTime(request.createdAt)}
              </p>
            </div>

            <div className="flex gap-2">
              {request.status === "draft" && (
                <Button size="sm" onClick={() => updateStatus({ id: request.id, status: "submitted" })} disabled={isPending}>
                  Submit
                </Button>
              )}
              {request.status === "submitted" && (
                <>
                  <Button size="sm" onClick={() => updateStatus({ id: request.id, status: "approved" })} disabled={isPending}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus({ id: request.id, status: "rejected" })}
                    disabled={isPending}
                  >
                    Reject
                  </Button>
                </>
              )}
              {request.status === "approved" && (
                <Button
                  size="sm"
                  onClick={() => {
                    updateStatus({ id: request.id, status: "converted" })
                    router.push("/dashboard/purchase/orders/create")
                  }}
                  disabled={isPending}
                >
                  Convert to Purchase Order
                </Button>
              )}
              {request.status === "converted" && <Badge variant="outline">Converted</Badge>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
