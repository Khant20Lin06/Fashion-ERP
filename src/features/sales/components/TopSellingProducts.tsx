"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { useProductPerformance } from "../hooks/useSales"

/** Top Selling Products widget for the Sales Dashboard, ranked by units sold. */
export function TopSellingProducts() {
  const { data, isLoading } = useProductPerformance()
  const topProducts = (data ?? []).slice().sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
        ) : topProducts.length === 0 ? (
          <EmptyState title="No sales data" description="Product performance will appear here once available." />
        ) : (
          topProducts.map((product, index) => (
            <div key={product.productName} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(product.unitsSold)} units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(product.revenue)}</p>
                <p className="text-xs text-muted-foreground">{formatPercent(product.profitMargin)} margin</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
