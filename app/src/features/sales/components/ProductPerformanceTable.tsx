"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { useProductPerformance } from "../hooks/useSales"
import type { ProductPerformancePoint } from "../types"

/** Product Performance table — Top Selling / Slow Moving products with profit margin. */
export function ProductPerformanceTable() {
  const { data, isLoading } = useProductPerformance()

  if (isLoading) return <Skeleton className="h-48 w-full" />

  if (!data || data.length === 0) {
    return <EmptyState title="No product performance data" description="Sales activity will populate this table." />
  }

  const sorted = data.slice().sort((a, b) => b.unitsSold - a.unitsSold)
  const slowMoving = sorted.slice(-3).reverse()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Top Selling Products</h3>
        <ProductTable rows={sorted.slice(0, 5)} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Slow Moving Products</h3>
        <ProductTable rows={slowMoving} />
      </div>
    </div>
  )
}

function ProductTable({ rows }: { rows: ProductPerformancePoint[] | undefined }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Units Sold</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Profit Margin</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(rows ?? []).map((point) => (
          <TableRow key={point.productName}>
            <TableCell className="font-medium">{point.productName}</TableCell>
            <TableCell>{formatNumber(point.unitsSold)}</TableCell>
            <TableCell>{formatCurrency(point.revenue)}</TableCell>
            <TableCell>{formatPercent(point.profitMargin)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
