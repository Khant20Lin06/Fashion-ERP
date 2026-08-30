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
          const performance = USE_MOCK ? mockSupplierPerformance[supplier.id] : null
          return (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{performance ? `${performance.avgDeliveryDays} days` : "Not tracked"}</TableCell>
              <TableCell>{performance ? formatPercent(performance.orderAccuracy) : "Not tracked"}</TableCell>
              <TableCell>{performance ? `${performance.qualityRating.toFixed(1)} / 5` : "Not tracked"}</TableCell>
              <TableCell>{formatCurrency(performance?.purchaseVolume ?? supplier.totalPurchase)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
