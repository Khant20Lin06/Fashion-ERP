"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useProductRankings } from "../hooks/useReports"

/** Top Products widget for the Executive Dashboard, ranked by revenue. */
export function TopProductsCard() {
  const { data, isLoading } = useProductRankings()
  const top = (data ?? []).slice().sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Products</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : top.length === 0 ? (
          <EmptyState title="No product data" description="Product rankings will appear here." />
        ) : (
          top.map((product, index) => (
            <div key={product.productName} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <span className="font-medium">{product.productName}</span>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(product.revenue)}</p>
                <p className="text-xs text-muted-foreground">{formatNumber(product.unitsSold)} units</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
