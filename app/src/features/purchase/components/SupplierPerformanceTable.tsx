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
import { formatCurrency, formatPercent } from "@/lib/format"
import { useSuppliers } from "../hooks/useSuppliers"
import { mockSupplierPerformance } from "../api/mock-data"

/** Supplier performance comparison — delivery time, order accuracy, quality rating, purchase volume. */
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
