"use client"

import { useMemo } from "react"
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
} from "@/components/data-table"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { formatCurrency } from "@/lib/format"
import { usePurchaseOrders } from "../hooks/usePurchaseOrders"
import { useSuppliers } from "../hooks/useSuppliers"
import { usePurchaseStore } from "../stores/purchase.store"
import type { PurchaseOrder } from "../types"

/** Purchase Order list — the primary /purchase/orders view. */
export function PurchaseOrderTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = usePurchaseOrders()
  const { data: suppliers } = useSuppliers()
  const { filters, setFilter } = usePurchaseStore()

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((order) => {
      if (filters.supplier && order.supplierId !== filters.supplier) return false
      if (filters.status && order.status !== filters.status) return false
      return true
    })
  }, [data, filters])

  const columns: DataTableColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: "poNumber",
      header: ({ column }) => <ColumnHeader column={column} title="PO Number" />,
      cell: ({ row }) => (
        <button
          className="font-mono text-left text-sm font-medium hover:underline"
          onClick={() => router.push(`/dashboard/purchase/orders/${row.original.id}`)}
        >
          {row.getValue("poNumber")}
        </button>
      ),
    },
    {
      accessorKey: "supplierName",
      header: ({ column }) => <ColumnHeader column={column} title="Supplier" />,
    },
    {
      accessorKey: "date",
      header: ({ column }) => <ColumnHeader column={column} title="Date" />,
      cell: ({ row }) => new Date(row.getValue<string>("date")).toLocaleDateString(),
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
      cell: ({ row }) => <PurchaseStatusBadge status={row.getValue("status")} />,
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/purchase/orders/${row.original.id}`)}>
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
      searchPlaceholder="Search purchase orders..."
      filterFields={[
        {
          key: "supplier",
          label: "Supplier",
          options: (suppliers ?? []).map((s) => ({ label: s.name, value: s.id })),
        },
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Pending Approval", value: "pending_approval" },
            { label: "Approved", value: "approved" },
            { label: "Partially Received", value: "partially_received" },
            { label: "Received", value: "received" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={(values) => {
        for (const key of ["supplier", "status"] as const) {
          setFilter(key, values[key])
        }
      }}
      exportFilename="purchase-orders"
      emptyTitle="No purchase orders found"
      emptyDescription="Create a purchase order to get started."
    />
  )
}
