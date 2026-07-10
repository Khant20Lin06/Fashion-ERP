"use client"

import { useState } from "react"
import { Check, ScanBarcode } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { formatNumber } from "@/lib/format"
import { useStockCounts, useSubmitStockCount } from "../hooks/useStockMovement"
import type { StockCountLine, StockCountStatus } from "../types"

const statusVariant: Record<StockCountStatus, "default" | "secondary" | "outline"> = {
  pending: "outline",
  reviewed: "secondary",
  approved: "default",
}

/** Physical inventory counting screen — System Qty vs Counted Qty vs Difference, with approval workflow. */
export function StockCountScreen() {
  const { data, isLoading, isError, refetch } = useStockCounts()
  const { mutate: submitCount, isPending } = useSubmitStockCount()
  const [draftLines, setDraftLines] = useState<Record<string, StockCountLine[]>>({})

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load stock count sessions." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No stock count sessions" description="Start a physical inventory count to see it here." />
  }

  function getLines(sessionId: string, fallback: StockCountLine[]) {
    return draftLines[sessionId] ?? fallback
  }

  function updateCountedQty(sessionId: string, lineId: string, fallback: StockCountLine[], countedQty: number) {
    const lines = getLines(sessionId, fallback).map((line) =>
      line.id === lineId
        ? { ...line, countedQty, difference: countedQty - line.systemQty, status: "reviewed" as StockCountStatus }
        : line
    )
    setDraftLines((prev) => ({ ...prev, [sessionId]: lines }))
  }

  return (
    <div className="flex flex-col gap-6">
      {data.map((session) => {
        const lines = getLines(session.id, session.lines)
        const allReviewed = lines.every((line) => line.countedQty !== null)

        return (
          <Card key={session.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{session.reference}</CardTitle>
                <p className="text-sm text-muted-foreground">{session.warehouseName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ScanBarcode /> Scan to Count
                </Button>
                <Badge variant={session.status === "completed" ? "default" : "secondary"} className="capitalize">
                  {session.status === "in_progress" ? "In Progress" : "Completed"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>System Qty</TableHead>
                    <TableHead>Counted Qty</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <p className="font-medium">{line.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {line.sku}
                          {line.variantLabel ? ` · ${line.variantLabel}` : ""}
                        </p>
                      </TableCell>
                      <TableCell>{formatNumber(line.systemQty)}</TableCell>
                      <TableCell>
                        <QuantityInput
                          value={line.countedQty ?? line.systemQty}
                          onChange={(value) => updateCountedQty(session.id, line.id, session.lines, value)}
                          min={0}
                        />
                      </TableCell>
                      <TableCell>
                        {line.countedQty === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={
                              line.difference > 0 ? "text-success" : line.difference < 0 ? "text-destructive" : "text-muted-foreground"
                            }
                          >
                            {line.difference > 0 ? "+" : ""}
                            {formatNumber(line.difference)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[line.status]} className="capitalize">
                          {line.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {session.status === "in_progress" && (
                <div className="flex justify-end">
                  <Button
                    disabled={!allReviewed || isPending}
                    onClick={() => submitCount({ sessionId: session.id, lines })}
                  >
                    <Check /> Submit for Approval
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
