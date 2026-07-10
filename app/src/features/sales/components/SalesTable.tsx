"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal } from "lucide-react"
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
  type FilterValues,
} from "@/components/data-table"
import { ReturnStatusBadge } from "@/components/sales/ReturnStatusBadge"
import { formatCurrency } from "@/lib/format"
import { useSalesOrders } from "../hooks/useSales"
import type { SalesOrder } from "../types"

/** Sales Order list — the primary /sales/orders view. */
export function SalesTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useSalesOrders()
  const [filters, setFilters] = useState<FilterValues>({})

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((order) => {
      if (filters.status && order.status !== filters.status) return false
      return true
    })
  }, [data, filters])

  const columns: DataTableColumnDef<SalesOrder>[] = [
    {
      accessorKey: "orderNumber",
      header: ({ column }) => <ColumnHeader column={column} title="Order Number" />,
      cell: ({ row }) => (
        <button
          className="font-mono text-left text-sm font-medium hover:underline"
          onClick={() => router.push(`/dashboard/sales/orders/${row.original.id}`)}
        >
          {row.getValue("orderNumber")}
        </button>
      ),
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => <ColumnHeader column={column} title="Customer" />,
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => row.original.items.length,
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => <ColumnHeader column={column} title="Total Amount" />,
      cell: ({ row }) => formatCurrency(row.getValue("grandTotal")),
    },
    {
      accessorKey: "deliveryDate",
      header: ({ column }) => <ColumnHeader column={column} title="Delivery Date" />,
      cell: ({ row }) => new Date(row.getValue<string>("deliveryDate")).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <ReturnStatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/sales/orders/${row.original.id}`)}>
              <Eye /> View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search sales orders..."
      filterFields={[
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Processing", value: "processing" },
            { label: "Delivered", value: "delivered" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={setFilters}
      exportFilename="sales-orders"
      emptyTitle="No sales orders found"
      emptyDescription="Create a sales order to get started."
    />
  )
}
