"use client"

import { env } from "@/config/env"
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
import { formatCurrency, formatPercent } from "@/lib/format"
import { useSuppliers } from "../hooks/useSuppliers"
import { mockSupplierPerformance } from "../api/mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

/** Supplier performance comparison — delivery time, order accuracy, quality
 * rating, purchase volume. Only purchase volume is derivable from a real
 * backend endpoint (GET /reports/purchase/by-supplier); delivery time,
 * order accuracy, and quality rating have no backend concept at all (no
 * delivery tracking, no QA/rating system) — BACKEND GAP, shown honestly
 * rather than fabricated. Mock-mode fixture data (keyed by fixture supplier
 * IDs) is not shown against real suppliers, since it would never match a
 * real supplier UUID and would either silently render nothing or, on an
 * ID collision, look like real data. */
export function SupplierPerformanceTable() {
  const { data: suppliers, isLoading } = useSuppliers()

  if (isLoading) return <Skeleton className="h-48 w-full" />

  if (!USE_MOCK) {
    return (
      <EmptyState
        title="Supplier performance not available"
        description="No backend delivery-time, accuracy, or quality-rating tracking exists yet."
      />
    )
  }

  if (!suppliers || suppliers.length === 0) {
    return <EmptyState title="No suppliers" description="Supplier performance will appear here once available." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Supplier</TableHead>
          <TableHead>Avg. Delivery Time</TableHead>
          <TableHead>Order Accuracy</TableHead>
          <TableHead>Quality Rating</TableHead>
          <TableHead>Purchase Volume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => {
          const performance = mockSupplierPerformance[supplier.id]
          if (!performance) return null
          return (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{performance.avgDeliveryDays} days</TableCell>
              <TableCell>{formatPercent(performance.orderAccuracy)}</TableCell>
              <TableCell>{performance.qualityRating.toFixed(1)} / 5</TableCell>
              <TableCell>{formatCurrency(performance.purchaseVolume)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
