"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { formatCurrency } from "@/lib/format"
import { useSuppliers, useDeleteSupplier } from "../hooks/useSuppliers"
import { usePurchaseStore } from "../stores/purchase.store"
import type { Supplier, SupplierStatus } from "../types"

const statusVariant: Record<SupplierStatus, "default" | "outline"> = {
  active: "default",
  inactive: "outline",
}

/** Supplier Master DataTable — the primary /purchase/suppliers list view. */
export function SupplierTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useSuppliers()
  const { mutate: deleteSupplier } = useDeleteSupplier()
  const { filters, setFilter } = usePurchaseStore()

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((supplier) => {
      if (filters.status && supplier.status !== filters.status) return false
      return true
    })
  }, [data, filters])

  const columns: DataTableColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <ColumnHeader column={column} title="Supplier Name" />,
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => router.push(`/dashboard/purchase/suppliers/${row.original.id}`)}
        >
          {row.getValue("name")}
        </button>
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => <ColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "contactPerson",
      header: ({ column }) => <ColumnHeader column={column} title="Contact Person" />,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <ColumnHeader column={column} title="Phone" />,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <ColumnHeader column={column} title="Email" />,
    },
    {
      accessorKey: "country",
      header: ({ column }) => <ColumnHeader column={column} title="Country" />,
    },
    {
      accessorKey: "totalPurchase",
      header: ({ column }) => <ColumnHeader column={column} title="Total Purchase" />,
      cell: ({ row }) => formatCurrency(row.getValue("totalPurchase")),
    },
    {
      accessorKey: "outstanding",
      header: ({ column }) => <ColumnHeader column={column} title="Outstanding" />,
      cell: ({ row }) => {
        const outstanding = row.getValue<number>("outstanding")
        return <span className={outstanding > 0 ? "text-warning" : ""}>{formatCurrency(outstanding)}</span>
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue<SupplierStatus>("status")
        return (
          <Badge variant={statusVariant[status]} className="capitalize">
            {status}
          </Badge>
        )
      },
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/purchase/suppliers/${row.original.id}`)}>
              <Eye /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/purchase/suppliers/${row.original.id}/edit`)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => deleteSupplier(row.original.id)}>
              <Trash2 /> Delete
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
      searchPlaceholder="Search suppliers..."
      filterFields={[
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={(values) => {
        for (const key of ["supplier", "status"] as const) {
          setFilter(key, values[key])
        }
      }}
      exportFilename="suppliers"
      emptyTitle="No suppliers found"
      emptyDescription="Add your first supplier to get started."
    />
  )
}
