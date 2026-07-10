"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Eye, MoreHorizontal, Package, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { StockBadge, deriveStockStatus } from "@/components/inventory/StockBadge"
import { formatNumber } from "@/lib/format"
import { useInventory } from "../hooks/useInventory"
import { useWarehouses } from "../hooks/useWarehouse"
import { useInventoryStore } from "../stores/inventory.store"
import type { InventoryItem } from "../types"

const columns: DataTableColumnDef<InventoryItem>[] = [
  {
    id: "image",
    header: "Image",
    enableSorting: false,
    cell: ({ row }) => {
      const url = row.original.imageUrl
      return (
        <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
          {url ? (
            <Image src={url} alt={row.original.productName} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "productName",
    header: ({ column }) => <ColumnHeader column={column} title="Product Name" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue("productName")}</span>,
  },
  {
    accessorKey: "sku",
    header: ({ column }) => <ColumnHeader column={column} title="SKU" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("sku")}</span>,
  },
  {
    id: "variant",
    header: "Variant",
    cell: ({ row }) => {
      const { color, size } = row.original
      return color || size ? [color, size].filter(Boolean).join(" / ") : "—"
    },
  },
  {
    accessorKey: "color",
    header: ({ column }) => <ColumnHeader column={column} title="Color" />,
    cell: ({ row }) => row.getValue("color") ?? "—",
  },
  {
    accessorKey: "size",
    header: ({ column }) => <ColumnHeader column={column} title="Size" />,
    cell: ({ row }) => row.getValue("size") ?? "—",
  },
  {
    accessorKey: "warehouseName",
    header: ({ column }) => <ColumnHeader column={column} title="Warehouse" />,
  },
  {
    accessorKey: "availableQty",
    header: ({ column }) => <ColumnHeader column={column} title="Available Qty" />,
    cell: ({ row }) => formatNumber(row.getValue("availableQty")),
  },
  {
    accessorKey: "reservedQty",
    header: ({ column }) => <ColumnHeader column={column} title="Reserved Qty" />,
    cell: ({ row }) => formatNumber(row.getValue("reservedQty")),
  },
  {
    accessorKey: "incomingQty",
    header: ({ column }) => <ColumnHeader column={column} title="Incoming Qty" />,
    cell: ({ row }) => formatNumber(row.getValue("incomingQty")),
  },
  {
    id: "status",
    header: "Stock Status",
    cell: ({ row }) => {
      const item = row.original
      return <StockBadge status={deriveStockStatus(item.availableQty, item.reorderLevel, item.overstockLevel)} />
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Row actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <RefreshCw /> Adjust Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

/** Inventory Data Table — the primary /inventory stock overview list. */
export function InventoryTable() {
  const { data, isLoading, isError, refetch } = useInventory()
  const { data: warehouses } = useWarehouses()
  const { filters, setFilter, resetFilters } = useInventoryStore()

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((item) => {
      if (filters.warehouse && item.warehouseId !== filters.warehouse) return false
      if (filters.status) {
        const status = deriveStockStatus(item.availableQty, item.reorderLevel, item.overstockLevel)
        if (status !== filters.status) return false
      }
      return true
    })
  }, [data, filters])

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search product..."
      filterFields={[
        {
          key: "warehouse",
          label: "Warehouse",
          options: (warehouses ?? []).map((w) => ({ label: w.name, value: w.id })),
        },
        {
          key: "status",
          label: "Stock Status",
          options: [
            { label: "Available", value: "available" },
            { label: "Low Stock", value: "low_stock" },
            { label: "Out of Stock", value: "out_of_stock" },
            { label: "Over Stock", value: "over_stock" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={(values) => {
        resetFilters()
        for (const [key, value] of Object.entries(values)) {
          setFilter(key as keyof typeof filters, value)
        }
      }}
      exportFilename="inventory"
      emptyTitle="No inventory records found"
      emptyDescription="Try adjusting your search or filters."
    />
  )
}
