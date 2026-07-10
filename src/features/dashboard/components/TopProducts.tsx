"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { TopProduct } from "../types"

type TopProductsProps = {
  data: TopProduct[] | undefined
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
}

export function TopProducts({ data, isLoading, isError, onRetry }: TopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best-selling items this period</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : isError ? (
          <ErrorState message="Couldn't load top products." onRetry={onRetry} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No products found" description="Top-selling products will appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {data.map((product, index) => (
              <li key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {product.sku} · {product.category} · {formatNumber(product.unitsSold)} sold
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium">{formatCurrency(product.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
