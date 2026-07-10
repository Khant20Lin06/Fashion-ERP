"use client"

import { useMemo, useState } from "react"
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
  type FilterValues,
} from "@/components/data-table"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useCustomers, useDeleteCustomer } from "../hooks/useCustomers"
import type { Customer, CustomerStatus } from "../types"

const statusVariant: Record<CustomerStatus, "default" | "outline"> = {
  active: "default",
  inactive: "outline",
}

/** Customer Master DataTable — the primary /sales/customers list view. */
export function CustomerTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useCustomers()
  const { mutate: deleteCustomer } = useDeleteCustomer()
  const [filters, setFilters] = useState<FilterValues>({})

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((customer) => {
      if (filters.status && customer.status !== filters.status) return false
      return true
    })
  }, [data, filters])

  const columns: DataTableColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <ColumnHeader column={column} title="Customer Name" />,
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => router.push(`/dashboard/sales/customers/${row.original.id}`)}
        >
          {row.getValue("name")}
        </button>
      ),
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
      accessorKey: "customerGroup",
      header: ({ column }) => <ColumnHeader column={column} title="Customer Group" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("customerGroup")}</Badge>,
    },
    {
      accessorKey: "totalOrders",
      header: ({ column }) => <ColumnHeader column={column} title="Total Orders" />,
      cell: ({ row }) => formatNumber(row.getValue("totalOrders")),
    },
    {
      accessorKey: "totalSpending",
      header: ({ column }) => <ColumnHeader column={column} title="Total Spending" />,
      cell: ({ row }) => formatCurrency(row.getValue("totalSpending")),
    },
    {
      accessorKey: "loyaltyPoints",
      header: ({ column }) => <ColumnHeader column={column} title="Loyalty Points" />,
      cell: ({ row }) => formatNumber(row.getValue("loyaltyPoints")),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue<CustomerStatus>("status")
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/sales/customers/${row.original.id}`)}>
              <Eye /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/sales/customers/${row.original.id}/edit`)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => deleteCustomer(row.original.id)}>
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
      searchPlaceholder="Search customers..."
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
      onFilterChange={setFilters}
      exportFilename="customers"
      emptyTitle="No customers found"
      emptyDescription="Add your first customer to get started."
    />
  )
}
