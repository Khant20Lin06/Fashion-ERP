"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatRelativeTime } from "@/lib/format"
import { useGoodsReceipts } from "../hooks/useGoodsReceipt"

/** List of the latest confirmed Goods Receipt Notes. */
export function GoodsReceiptList() {
  const { data, isLoading, isError, refetch } = useGoodsReceipts()
  const recentReceipts = [...(data ?? [])]
    .sort((a, b) => new Date(b.createdAt ?? b.receivedAt).getTime() - new Date(a.createdAt ?? a.receivedAt).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load goods receipts." onRetry={refetch} />

  if (recentReceipts.length === 0) {
    return <EmptyState title="No goods receipts yet" description="Confirmed receipts will appear here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {recentReceipts.map((receipt) => {
        const totalReceived = receipt.items.reduce((sum, i) => sum + i.receivedQty, 0)
        const totalRejected = receipt.items.reduce((sum, i) => sum + i.rejectedQty, 0)
        return (
          <Card key={receipt.id}>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium">{receipt.reference}</p>
                  <Badge>Confirmed</Badge>
                </div>
                <p className="text-sm">
                  {receipt.poNumber} · {receipt.supplierName} · {receipt.warehouseName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {receipt.receivedBy} · confirmed {formatRelativeTime(receipt.createdAt ?? receipt.receivedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Receipt date: {new Date(receipt.receivedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-success">+{formatNumber(totalReceived)} received</p>
                {totalRejected > 0 && <p className="text-destructive">{formatNumber(totalRejected)} rejected</p>}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
