"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { usePurchaseReturns } from "../hooks/usePayments"
import type { ReturnReason } from "../types"

const reasonLabels: Record<ReturnReason, string> = {
  damaged_product: "Damaged Product",
  wrong_item: "Wrong Item",
  quality_issue: "Quality Issue",
  supplier_return: "Supplier Return",
}

/** Purchase Return list — reason, status, and returned line items. */
export function PurchaseReturnList() {
  const { data, isLoading, isError, refetch } = usePurchaseReturns()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load purchase returns." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No purchase returns" description="Submitted returns will appear here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((purchaseReturn) => {
        const totalValue = purchaseReturn.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)
        return (
          <Card key={purchaseReturn.id}>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium">{purchaseReturn.reference}</p>
                  <PurchaseStatusBadge status={purchaseReturn.status} />
                  <Badge variant="outline">{reasonLabels[purchaseReturn.reason]}</Badge>
                </div>
                <p className="text-sm">
                  {purchaseReturn.supplierName}
                  {purchaseReturn.poNumber ? ` · ${purchaseReturn.poNumber}` : ""}
                </p>
                {purchaseReturn.notes && <p className="text-xs text-muted-foreground">{purchaseReturn.notes}</p>}
                <p className="text-xs text-muted-foreground">{formatRelativeTime(purchaseReturn.createdAt)}</p>
              </div>
              <p className="font-semibold">{formatCurrency(totalValue)}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
