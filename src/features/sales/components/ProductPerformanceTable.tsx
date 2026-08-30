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
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useProductPerformance } from "../hooks/useSales"
import type { ProductPerformancePoint, SalesReportFilters } from "../types"

/** Product Performance table: Top Selling and Slow Moving products from real backend aggregates. */
export function ProductPerformanceTable({ filters }: { filters?: SalesReportFilters }) {
  const { data, isLoading, isError, refetch } = useProductPerformance(filters)

  if (isLoading) return <Skeleton className="h-48 w-full" />

  if (isError) return <ErrorState message="Couldn't load product performance." onRetry={refetch} />

  if (!data || (data.topSelling.length === 0 && data.slowMoving.length === 0)) {
    return <EmptyState title="No product performance data" description="Sales activity will populate this table." />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Top Selling Products</h3>
        <ProductTable rows={data.topSelling} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Slow Moving Products</h3>
        <ProductTable rows={data.slowMoving} />
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {(rows ?? []).map((point) => (
          <TableRow key={point.productName}>
            <TableCell className="font-medium">{point.productName}</TableCell>
            <TableCell>{formatNumber(point.unitsSold)}</TableCell>
            <TableCell>{formatCurrency(point.revenue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
