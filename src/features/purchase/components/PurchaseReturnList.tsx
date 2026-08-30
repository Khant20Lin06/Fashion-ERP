"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useCancelPurchaseReturn, useCompletePurchaseReturn, usePurchaseReturns } from "../hooks/usePayments"
import type { ReturnReason } from "../types"

const reasonLabels: Record<ReturnReason, string> = {
  damaged_product: "Damaged Product",
  wrong_item: "Wrong Item",
  quality_issue: "Quality Issue",
  supplier_return: "Supplier Return",
}

export function PurchaseReturnList() {
  const { data, isLoading, isError, refetch } = usePurchaseReturns()
  const completeReturn = useCompletePurchaseReturn()
  const cancelReturn = useCancelPurchaseReturn()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
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
        const totalValue = purchaseReturn.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
        return (
          <Card key={purchaseReturn.id}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-medium">{purchaseReturn.reference}</p>
                    <PurchaseStatusBadge status={purchaseReturn.status} />
                    <Badge variant="outline">{reasonLabels[purchaseReturn.reason]}</Badge>
                  </div>
                  <p className="text-sm">
                    {purchaseReturn.supplierName} · {purchaseReturn.invoiceNumber} · {purchaseReturn.poNumber}
                  </p>
                  {purchaseReturn.notes && <p className="text-xs text-muted-foreground">{purchaseReturn.notes}</p>}
                  <p className="text-xs text-muted-foreground">
                    Created {formatRelativeTime(purchaseReturn.createdAt)}
                    {purchaseReturn.completedAt ? ` · Completed ${formatRelativeTime(purchaseReturn.completedAt)}` : ""}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-semibold">{formatCurrency(totalValue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Applied to invoice: {formatCurrency(purchaseReturn.creditAppliedAmount)}
                  </p>
                  {purchaseReturn.supplierCreditAmount > 0 && (
                    <p className="text-xs text-amber-600">Supplier credit: {formatCurrency(purchaseReturn.supplierCreditAmount)}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {purchaseReturn.status === "draft" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => completeReturn.mutate(purchaseReturn.id)}
                      disabled={completeReturn.isPending}
                    >
                      Complete Return
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelReturn.mutate(purchaseReturn.id)}
                      disabled={cancelReturn.isPending}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
