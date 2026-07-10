"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { Separator } from "@/components/ui/separator"
import { formatNumber, formatRelativeTime } from "@/lib/format"
import { useStockMovements } from "../hooks/useStockMovement"
import type { MovementType, StockMovement } from "../types"

const movementTypeLabels: Record<MovementType, string> = {
  purchase_receipt: "Purchase Receipt",
  sales_delivery: "Sales Delivery",
  stock_transfer: "Stock Transfer",
  stock_adjustment: "Stock Adjustment",
  return: "Return",
  damage: "Damage",
  opening_stock: "Opening Stock",
}

const movementTypeVariant: Record<MovementType, "default" | "secondary" | "outline" | "destructive"> = {
  purchase_receipt: "default",
  sales_delivery: "secondary",
  stock_transfer: "outline",
  stock_adjustment: "outline",
  return: "secondary",
  damage: "destructive",
  opening_stock: "outline",
}

/** Inventory ledger — every stock-affecting transaction across all warehouses. */
export function StockMovementTable() {
  const { data, isLoading, isError, refetch } = useStockMovements()
  const [selected, setSelected] = useState<StockMovement | null>(null)

  const columns: DataTableColumnDef<StockMovement>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => <ColumnHeader column={column} title="Date" />,
      cell: ({ row }) => (
        <button className="text-left hover:underline" onClick={() => setSelected(row.original)}>
          {new Date(row.getValue<string>("date")).toLocaleDateString()}
        </button>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <ColumnHeader column={column} title="Transaction Type" />,
      cell: ({ row }) => {
        const type = row.getValue<MovementType>("type")
        return <Badge variant={movementTypeVariant[type]}>{movementTypeLabels[type]}</Badge>
      },
    },
    {
      accessorKey: "reference",
      header: ({ column }) => <ColumnHeader column={column} title="Reference" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("reference")}</span>,
    },
    {
      accessorKey: "productName",
      header: ({ column }) => <ColumnHeader column={column} title="Product" />,
    },
    {
      accessorKey: "variantLabel",
      header: "Variant",
      cell: ({ row }) => row.getValue("variantLabel") ?? "—",
    },
    {
      accessorKey: "warehouseName",
      header: ({ column }) => <ColumnHeader column={column} title="Warehouse" />,
    },
    {
      accessorKey: "qtyBefore",
      header: ({ column }) => <ColumnHeader column={column} title="Qty Before" />,
      cell: ({ row }) => formatNumber(row.getValue("qtyBefore")),
    },
    {
      accessorKey: "qtyChange",
      header: ({ column }) => <ColumnHeader column={column} title="Qty Change" />,
      cell: ({ row }) => {
        const change = row.getValue<number>("qtyChange")
        return (
          <span className={change > 0 ? "text-success" : change < 0 ? "text-destructive" : "text-muted-foreground"}>
            {change > 0 ? "+" : ""}
            {formatNumber(change)}
          </span>
        )
      },
    },
    {
      accessorKey: "qtyAfter",
      header: ({ column }) => <ColumnHeader column={column} title="Qty After" />,
      cell: ({ row }) => formatNumber(row.getValue("qtyAfter")),
    },
    {
      accessorKey: "user",
      header: ({ column }) => <ColumnHeader column={column} title="User" />,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        searchPlaceholder="Search movements..."
        exportFilename="stock-movements"
        emptyTitle="No stock movements"
        emptyDescription="Transactions will appear here as stock changes."
      />

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Transaction Detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="flex flex-col gap-4 px-4 pb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Reference No</p>
                  <p className="font-mono font-medium">{selected.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{formatRelativeTime(selected.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">User</p>
                  <p className="font-medium">{selected.user}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Badge variant={movementTypeVariant[selected.type]}>{movementTypeLabels[selected.type]}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Product</p>
                  <p className="font-medium">{selected.productName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{selected.sku}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Variant</p>
                  <p className="font-medium">{selected.variantLabel ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Warehouse</p>
                  <p className="font-medium">{selected.warehouseName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className={selected.qtyChange > 0 ? "font-medium text-success" : selected.qtyChange < 0 ? "font-medium text-destructive" : "font-medium"}>
                    {selected.qtyChange > 0 ? "+" : ""}
                    {formatNumber(selected.qtyChange)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Before Stock</p>
                  <p className="font-medium">{formatNumber(selected.qtyBefore)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">After Stock</p>
                  <p className="font-medium">{formatNumber(selected.qtyAfter)}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
